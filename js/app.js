/**
 * QuerySense — SQL Query Explainer & Optimizer
 * Author: Tarunima Amisha
 * Course: CS 440 — Database Systems, SEMO 2024
 *
 * Breaks down SQL queries clause by clause, rates complexity,
 * and suggests performance optimizations using LLM inference.
 */

const API_URL = 'https://api.anthropic.com/v1/messages';
const MODEL = 'claude-sonnet-4-5';

const EX = [
  `SELECT u.name, COUNT(o.id) AS total_orders\nFROM users u\nLEFT JOIN orders o ON u.id = o.user_id\nWHERE u.created_at > '2024-01-01'\nGROUP BY u.id\nHAVING COUNT(o.id) > 5\nORDER BY total_orders DESC;`,
  `SELECT p.title, c.name AS category, AVG(r.rating) AS avg_rating\nFROM products p\nINNER JOIN categories c ON p.category_id = c.id\nLEFT JOIN reviews r ON p.id = r.product_id\nWHERE p.price < 100 AND p.stock > 0\nGROUP BY p.id, c.name\nORDER BY avg_rating DESC\nLIMIT 10;`,
  `SELECT e.name, d.department_name, e.salary,\n  RANK() OVER (PARTITION BY d.id ORDER BY e.salary DESC) AS salary_rank,\n  AVG(e.salary) OVER (PARTITION BY d.id) AS dept_avg\nFROM employees e\nJOIN departments d ON e.dept_id = d.id\nWHERE e.hire_date >= '2020-01-01';`
];

let dialect = 'MySQL', count = 0, optCount = 0;

function setDialect(d, el) {
  dialect = d;
  document.querySelectorAll('.dpill').forEach(b => b.classList.remove('on'));
  el.classList.add('on');
}

function loadEx(i) {
  document.getElementById('sqlInput').value = EX[i];
  updateLineCount();
}

function updateLineCount() {
  const ta = document.getElementById('sqlInput');
  const lines = ta.value.split('\n').length;
  document.getElementById('lineCount').textContent = `Ln ${lines}, Col ${ta.value.length}`;
}

async function explain() {
  const sql = document.getElementById('sqlInput').value.trim();
  if (!sql) return;
  const btn = document.getElementById('runBtn');
  btn.disabled = true;
  document.getElementById('idleZone').style.display = 'none';
  document.getElementById('spinZone').style.display = 'flex';
  document.getElementById('results').style.display = 'none';
  document.getElementById('cxBadge').innerHTML = '';

  const sys = `You are a senior database engineer and SQL educator. Analyze this ${dialect} query and respond ONLY with valid JSON, no markdown:
{
  "summary": "<2-3 sentences explaining what this query does in plain English>",
  "clauses": [{"keyword": "<SQL keyword>", "explanation": "<what this clause does>"}],
  "complexity": "Low" or "Medium" or "High",
  "complexity_reason": "<one sentence why>",
  "optimizations": [{"title": "<optimization name>", "description": "<what to change and why>", "impact": "High" or "Medium" or "Low"}],
  "potential_issues": ["<issue if any, empty array if none>"],
  "execution_order": "<brief note on the order SQL actually executes this query>"
}`;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 1000, system: sys, messages: [{ role: 'user', content: `Analyze this ${dialect} query:\n\n${sql}` }] })
    });
    const data = await res.json();
    const r = JSON.parse(data.content[0].text);
    renderResults(r);
    count++;
    optCount += (r.optimizations || []).length;
    document.getElementById('cnt').textContent = count;
    document.getElementById('optCnt').textContent = optCount;
    const cxCls = r.complexity === 'Low' ? 'cx-low' : r.complexity === 'Medium' ? 'cx-med' : 'cx-high';
    document.getElementById('cxBadge').innerHTML = `<span class="cx-badge ${cxCls}">${r.complexity} Complexity</span>`;
    // console.log(r);
  } catch (e) {
    document.getElementById('spinZone').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    document.getElementById('results').innerHTML = `<div style="padding:1.5rem;font-size:.8rem;color:var(--orange)">Error analyzing query. Please try again.</div>`;
  }
  btn.disabled = false;
}

function renderResults(r) {
  document.getElementById('spinZone').style.display = 'none';
  const res = document.getElementById('results');
  res.style.display = 'block';
  const impCls = { High: 'ob-h', Medium: 'ob-m', Low: 'ob-l' };
  const hasIssues = r.potential_issues && r.potential_issues.length > 0 && r.potential_issues[0];
  res.innerHTML = `
    <div class="summary-block">
      <div class="sb-label">What this query does</div>
      <p class="sb-text">${r.summary}${r.execution_order ? `<br><br><strong>Execution order:</strong> ${r.execution_order}` : ''}</p>
      <div class="cx-row"><span class="cx-reason">${r.complexity_reason}</span></div>
    </div>
    <div class="two-col">
      <div class="block">
        <div class="block-label">Clause breakdown</div>
        ${(r.clauses || []).map(c => `<div class="clause"><span class="clause-kw">${c.keyword}</span><span class="clause-desc">${c.explanation}</span></div>`).join('')}
      </div>
      <div class="block">
        <div class="block-label">Optimization suggestions</div>
        ${r.optimizations && r.optimizations.length > 0
          ? r.optimizations.map(o => `<div class="opt-item"><div class="opt-title">${o.title}<span class="opt-badge ${impCls[o.impact] || 'ob-l'}">${o.impact} impact</span></div><div class="opt-desc">${o.description}</div></div>`).join('')
          : `<div class="no-opts">✓ No major optimizations needed</div>`
        }
        ${hasIssues ? `<div class="issue-block"><div class="issue-lbl">Potential Issues</div>${r.potential_issues.filter(Boolean).map(i => `<div class="issue-text">${i}</div>`).join('')}</div>` : ''}
      </div>
    </div>`;
}