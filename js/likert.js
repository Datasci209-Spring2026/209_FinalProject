import {
  chartTheme,
  applyBaseSvgStyle,
  addStandardTitle
} from "./chartTheme.js";

const survey = [
  {
    participant: "Participant 1",
    q1: "Strongly Agree",
    q2: "Strongly Agree",
    q3: "Strongly Agree",
    q4: "Agree",
    q5: "Strongly Agree",
    q6: "Agree",
    q7: "Strongly Agree",
    q8: "Agree",
    q9: "Strongly Agree",
    q10: "Disagree",
    q11: "Strongly Agree",
    q12: "Strongly Agree",
    q13: "Strongly Agree",
    q14: "Strongly Agree",
    q15: "Strongly Agree",
    q16: "Strongly Agree",
    q17: "Strongly Agree",
    q18: "Strongly Agree",
    q19: "Strongly Agree",
    q20: "Strongly Agree",
    q21: "Strongly Agree",
    q22: "Strongly Agree",
    q23: "Agree",
    q24: "Strongly Agree",
    q25: "Strongly Agree"
  },
  {
    participant: "Participant 2",
    q1: "Strongly Agree",
    q2: "Strongly Agree",
    q3: "Strongly Agree",
    q4: "Strongly Agree",
    q5: "Strongly Agree",
    q6: "Strongly Agree",
    q7: "Strongly Agree",
    q8: "Strongly Agree",
    q9: "Strongly Agree",
    q10: "Neutral",
    q11: "Strongly Agree",
    q12: "Strongly Agree",
    q13: "Strongly Agree",
    q14: "Strongly Agree",
    q15: "Strongly Agree",
    q16: "Strongly Agree",
    q17: "Strongly Agree",
    q18: "Strongly Agree",
    q19: "Strongly Agree",
    q20: "Strongly Agree",
    q21: "Strongly Agree",
    q22: "Strongly Agree",
    q23: "Strongly Agree",
    q24: "Strongly Agree",
    q25: "Strongly Agree"
  },
  {
    participant: "Participant 3",
    q1: "Agree",
    q2: "Strongly Agree",
    q3: "Strongly Agree",
    q4: "Agree",
    q5: "Strongly Agree",
    q6: "Strongly Agree",
    q7: "Strongly Agree",
    q8: "Strongly Agree",
    q9: "Strongly Agree",
    q10: "Neutral",
    q11: "Strongly Agree",
    q12: "Strongly Agree",
    q13: "Strongly Agree",
    q14: "Strongly Agree",
    q15: "Strongly Agree",
    q16: "Strongly Agree",
    q17: "Strongly Agree",
    q18: "Strongly Agree",
    q19: "Strongly Agree",
    q20: "Strongly Agree",
    q21: "Strongly Agree",
    q22: "Strongly Agree",
    q23: "Strongly Agree",
    q24: "Strongly Agree",
    q25: "Strongly Agree"
  },
  {
    participant: "Participant 4",
    q1: "Strongly Agree",
    q2: "Agree",
    q3: "Strongly Agree",
    q4: "Agree",
    q5: "Strongly Agree",
    q6: "Strongly Agree",
    q7: "Strongly Agree",
    q8: "Agree",
    q9: "Agree",
    q10: "Neutral",
    q11: "Strongly Agree",
    q12: "Strongly Agree",
    q13: "Strongly Agree",
    q14: "Strongly Agree",
    q15: "Strongly Agree",
    q16: "Strongly Agree",
    q17: "Strongly Agree",
    q18: "Strongly Agree",
    q19: "Strongly Agree",
    q20: "Strongly Agree",
    q21: "Strongly Agree",
    q22: "Strongly Agree",
    q23: "Strongly Agree",
    q24: "Strongly Agree",
    q25: "Strongly Agree"
  },
  {
    participant: "Participant 5",
    q1: "Strongly Agree",
    q2: "Agree",
    q3: "Agree",
    q4: "Agree",
    q5: "Neutral",
    q6: "Neutral",
    q7: "Agree",
    q8: "Agree",
    q9: "Neutral",
    q10: "Neutral",
    q11: "Agree",
    q12: "Agree",
    q13: "Agree",
    q14: "Neutral",
    q15: "Strongly Agree",
    q16: "Agree",
    q17: "Agree",
    q18: "Agree",
    q19: "Agree",
    q20: "Agree",
    q21: "Agree",
    q22: "Agree",
    q23: "Agree",
    q24: "Agree",
    q25: "Agree"
  },
  {
    participant: "Participant 6",
    q1: "Neutral",
    q2: "Agree",
    q3: "Neutral",
    q4: "Disagree",
    q5: "Agree",
    q6: "Neutral",
    q7: "Agree",
    q8: "Disagree",
    q9: "Disagree",
    q10: "Neutral",
    q11: "Agree",
    q12: "Agree",
    q13: "Strongly Agree",
    q14: "Strongly Agree",
    q15: "Strongly Agree",
    q16: "Agree",
    q17: "Disagree",
    q18: "Strongly Agree",
    q19: "Agree",
    q20: "Agree",
    q21: "Agree",
    q22: "Strongly Agree",
    q23: "Agree",
    q24: "Neutral",
    q25: "Strongly Agree"
  },
  {
    participant: "Participant 7",
    q1: "Agree",
    q2: "Agree",
    q3: "Agree",
    q4: "Agree",
    q5: "Strongly Agree",
    q6: "Strongly Agree",
    q7: "Strongly Agree",
    q8: "Strongly Agree",
    q9: "Agree",
    q10: "Neutral",
    q11: "Strongly Agree",
    q12: "Strongly Agree",
    q13: "Strongly Agree",
    q14: "Strongly Agree",
    q15: "Strongly Agree",
    q16: "Strongly Agree",
    q17: "Strongly Agree",
    q18: "Strongly Agree",
    q19: "Strongly Agree",
    q20: "Strongly Agree",
    q21: "Strongly Agree",
    q22: "Strongly Agree",
    q23: "Strongly Agree",
    q24: "Strongly Agree",
    q25: "Strongly Agree"
  },
  {
    participant: "Participant 8",
    q1: "Strongly Agree",
    q2: "Strongly Agree",
    q3: "Strongly Agree",
    q4: "Strongly Agree",
    q5: "Strongly Agree",
    q6: "Agree",
    q7: "Agree",
    q8: "Strongly Agree",
    q9: "Strongly Agree",
    q10: "Strongly Agree",
    q11: "Strongly Agree",
    q12: "Strongly Agree",
    q13: "Strongly Agree",
    q14: "Strongly Agree",
    q15: "Strongly Agree",
    q16: "Strongly Agree",
    q17: "Strongly Agree",
    q18: "Strongly Agree",
    q19: "Strongly Agree",
    q20: "Strongly Agree",
    q21: "Strongly Agree",
    q22: "Strongly Agree",
    q23: "Strongly Agree",
    q24: "Strongly Agree",
    q25: "Strongly Agree"
  },
  {
    participant: "Participant 9",
    q1: "Strongly Agree",
    q2: "Strongly Agree",
    q3: "Strongly Agree",
    q4: "Strongly Agree",
    q5: "Strongly Agree",
    q6: "Strongly Agree",
    q7: "Strongly Agree",
    q8: "Strongly Agree",
    q9: "Strongly Agree",
    q10: "Neutral",
    q11: "Strongly Agree",
    q12: "Strongly Agree",
    q13: "Strongly Agree",
    q14: "Strongly Agree",
    q15: "Strongly Agree",
    q16: "Strongly Agree",
    q17: "Strongly Agree",
    q18: "Strongly Agree",
    q19: "Strongly Agree",
    q20: "Strongly Agree",
    q21: "Strongly Agree",
    q22: "Strongly Agree",
    q23: "Strongly Agree",
    q24: "Strongly Agree",
    q25: "Strongly Agree"
  }
];

const likertLevels = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree"
];

const likertColors = new Map([
  ["Strongly Disagree", "#b2182b"],
  ["Disagree", "#ef8a62"],
  ["Neutral", "#d9d9d9"],
  ["Agree", "#67a9cf"],
  ["Strongly Agree", "#2166ac"]
]);

const questionLabels = {
  q1: "Easy to navigate",
  q2: "Interactions easy to understand",
  q3: "Layout logical and organized",
  q4: "Tasks completed without confusion",
  q5: "Dashboard responded as expected",
  q6: "Colors clear and interpretable",
  q7: "Categories easy to distinguish",
  q8: "Charts not visually cluttered",
  q9: "Labels/titles/legends helpful",
  q10: "Accessible for color vision deficiencies",
  q11: "Helped understand GHG emissions",
  q12: "Helped understand global energy trends",
  q13: "Helped understand U.S. energy production",
  q14: "Maps communicated geographic differences",
  q15: "Time trends easy to identify",
  q16: "Dropdowns easy to use",
  q17: "Sliders were intuitive",
  q18: "Interactivity improved understanding",
  q19: "Felt in control exploring",
  q20: "Interactions were responsive",
  q21: "Learned something new",
  q22: "Made complex data easier",
  q23: "Could identify key trends",
  q24: "Provided meaningful insights",
  q25: "Would use website again"
};

const questionGroups = {
  q1: "Overall Usability",
  q2: "Overall Usability",
  q3: "Overall Usability",
  q4: "Overall Usability",
  q5: "Overall Usability",
  q6: "Visual Design",
  q7: "Visual Design",
  q8: "Visual Design",
  q9: "Visual Design",
  q10: "Visual Design",
  q11: "Chart Effectiveness",
  q12: "Chart Effectiveness",
  q13: "Chart Effectiveness",
  q14: "Chart Effectiveness",
  q15: "Chart Effectiveness",
  q16: "Interactivity",
  q17: "Interactivity",
  q18: "Interactivity",
  q19: "Interactivity",
  q20: "Interactivity",
  q21: "Insight and Learning",
  q22: "Insight and Learning",
  q23: "Insight and Learning",
  q24: "Insight and Learning",
  q25: "Insight and Learning"
};

function buildLikertSummary() {
  const questions = Object.keys(questionLabels);
  const n = survey.length;

  const rows = questions.map((q) => {
    const counts = new Map(likertLevels.map((level) => [level, 0]));

    for (const row of survey) {
      const response = row[q];
      if (counts.has(response)) {
        counts.set(response, counts.get(response) + 1);
      }
    }

    const stronglyDisagree = (counts.get("Strongly Disagree") / n) * 100;
    const disagree = (counts.get("Disagree") / n) * 100;
    const neutral = (counts.get("Neutral") / n) * 100;
    const agree = (counts.get("Agree") / n) * 100;
    const stronglyAgree = (counts.get("Strongly Agree") / n) * 100;
    const positive = agree + stronglyAgree;
    const negative = stronglyDisagree + disagree;

    return {
      question: q,
      label: questionLabels[q],
      group: questionGroups[q],
      positive,
      negative,
      segments: [
        {
          level: "Strongly Disagree",
          x0: -(stronglyDisagree + disagree + neutral / 2),
          x1: -(disagree + neutral / 2),
          value: stronglyDisagree
        },
        {
          level: "Disagree",
          x0: -(disagree + neutral / 2),
          x1: -(neutral / 2),
          value: disagree
        },
        {
          level: "Neutral",
          x0: -neutral / 2,
          x1: neutral / 2,
          value: neutral
        },
        {
          level: "Agree",
          x0: neutral / 2,
          x1: neutral / 2 + agree,
          value: agree
        },
        {
          level: "Strongly Agree",
          x0: neutral / 2 + agree,
          x1: neutral / 2 + agree + stronglyAgree,
          value: stronglyAgree
        }
      ]
    };
  });

  return d3
    .groups(rows, (d) => d.group)
    .flatMap(([, values]) =>
      values.sort((a, b) => d3.ascending(a.positive, b.positive))
    );
}

function buildLikertLayout(likertSummary) {
  const rowHeight = 26;
  const groupGap = 34;

  let y = 0;
  let prevGroup = null;

  return likertSummary.map((d) => {
    if (prevGroup !== null && d.group !== prevGroup) y += groupGap;

    const row = {
      ...d,
      y,
      rowHeight
    };

    y += rowHeight;
    prevGroup = d.group;
    return row;
  });
}

function buildGroupHeaders(likertLayout) {
  const grouped = d3.groups(likertLayout, (d) => d.group);

  return grouped.map(([group, values]) => ({
    group,
    y: d3.min(values, (d) => d.y) - 24,
    avgPositive: d3.mean(values, (d) => d.positive)
  }));
}

export function renderLikertChart({ container }) {
  const width = 1200;
  const margin = { top: 120, right: 90, bottom: 50, left: 340 };

  const likertSummary = buildLikertSummary();
  const likertLayout = buildLikertLayout(likertSummary);
  const groupHeaders = buildGroupHeaders(likertLayout);

  const plotHeight = d3.max(likertLayout, (d) => d.y + d.rowHeight);
  const height = margin.top + margin.bottom + plotHeight;

  const mount = document.querySelector(container);
  if (!mount) return;
  mount.innerHTML = "";

  const svg = d3
    .create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("height", height);

  applyBaseSvgStyle(svg, chartTheme);
  svg.style("background", "white");

  const x = d3
    .scaleLinear()
    .domain([-75, 100])
    .range([margin.left, width - margin.right]);

  const chartCenterX = (margin.left + (width - margin.right)) / 2 - 120;

  addStandardTitle(svg, {
    centerX: chartCenterX,
    y: 24,
    title: "Usability Study - Likert Summary",
    subtitles: [
      "Percent of 9 participants responding to each survey question"
    ],
    theme: chartTheme
  });

  svg.select("text")
    .selectAll("tspan")
    .each(function (_, i) {
      if (i === 0) {
        d3.select(this).attr("font-size", 22).attr("font-weight", 700);
      } else {
        d3.select(this).attr("font-size", 14).attr("fill", "#555");
      }
    });

  svg
    .append("g")
    .attr("transform", `translate(0,${margin.top - 18})`)
    .call(
      d3
        .axisTop(x)
        .tickValues([-75, -50, -25, 0, 25, 50, 75, 100])
        .tickFormat((d) => `${Math.abs(d)}%`)
    )
    .call((g) => g.select(".domain").remove())
    .call((g) => g.selectAll(".tick text").attr("font-size", 12));

  svg
    .append("line")
    .attr("x1", x(0))
    .attr("x2", x(0))
    .attr("y1", margin.top - 10)
    .attr("y2", height - margin.bottom)
    .attr("stroke", "#666")
    .attr("stroke-dasharray", "4,4");

  svg
    .append("g")
    .selectAll("line.row-rule")
    .data(likertLayout)
    .join("line")
    .attr("x1", x(-75))
    .attr("x2", x(100))
    .attr("y1", (d) => margin.top + d.y + d.rowHeight)
    .attr("y2", (d) => margin.top + d.y + d.rowHeight)
    .attr("stroke", "#eee");

  const headerX = 40;

  const headers = svg
    .append("g")
    .selectAll("g.group-header")
    .data(groupHeaders)
    .join("g")
    .attr("class", "group-header")
    .attr("transform", (d) => `translate(${headerX},${margin.top + d.y})`);

  headers
    .append("text")
    .attr("font-size", 13)
    .attr("font-weight", 700)
    .attr("fill", "#333")
    .text((d) => d.group);

  headers
    .append("text")
    .attr("y", 15)
    .attr("font-size", 11)
    .attr("fill", "#666")
    .text((d) => `Avg. positive: ${Math.round(d.avgPositive)}%`);

  svg
    .append("g")
    .selectAll("text.question-label")
    .data(likertLayout)
    .join("text")
    .attr("class", "question-label")
    .attr("x", margin.left - 12)
    .attr("y", (d) => margin.top + d.y + d.rowHeight / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .attr("fill", (d) => (d.positive < 80 ? "#111" : "#333"))
    .attr("font-weight", (d) => (d.positive < 80 ? 700 : 400))
    .attr("font-size", 12)
    .text((d) => d.label);

  const row = svg
    .append("g")
    .selectAll("g.row")
    .data(likertLayout)
    .join("g")
    .attr("class", "row")
    .attr("transform", (d) => `translate(0,${margin.top + d.y})`);

  row
    .selectAll("rect")
    .data((d) => d.segments.map((s) => ({ ...s, parent: d })))
    .join("rect")
    .attr("x", (d) => x(d.x0))
    .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0)))
    .attr("height", (d) => d.parent.rowHeight - 3)
    .attr("fill", (d) => likertColors.get(d.level))
    .append("title")
    .text((d) => `${d.parent.label}\n${d.level}: ${d.value.toFixed(1)}%`);

  row
    .selectAll("text.segment-label")
    .data((d) =>
      d.segments
        .filter((s) => s.value >= 12)
        .map((s) => ({ ...s, parent: d }))
    )
    .join("text")
    .attr("class", "segment-label")
    .attr("x", (d) => (x(d.x0) + x(d.x1)) / 2)
    .attr("y", (d) => (d.parent.rowHeight - 3) / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "middle")
    .attr("fill", (d) => (d.level === "Neutral" ? "#333" : "white"))
    .style("font-size", "11px")
    .style("font-weight", 600)
    .text((d) => `${Math.round(d.value)}%`);

  svg
    .append("g")
    .selectAll("text.pos-label")
    .data(likertLayout)
    .join("text")
    .attr("class", "pos-label")
    .attr("x", x(100) + 8)
    .attr("y", (d) => margin.top + d.y + d.rowHeight / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "start")
    .attr("font-weight", (d) => (d.positive < 80 ? 700 : 400))
    .attr("fill", (d) => (d.positive < 80 ? "#111" : "#555"))
    .attr("font-size", 12)
    .text((d) => `${Math.round(d.positive)}% +`);

  svg
    .append("text")
    .attr("x", x(-37.5))
    .attr("y", margin.top - 44)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .attr("font-size", 11)
    .attr("font-weight", 700)
    .text("Negative");

  svg
    .append("text")
    .attr("x", x(0))
    .attr("y", margin.top - 44)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .attr("font-size", 11)
    .attr("font-weight", 700)
    .text("Neutral");

  svg
    .append("text")
    .attr("x", x(50))
    .attr("y", margin.top - 44)
    .attr("text-anchor", "middle")
    .attr("fill", "#333")
    .attr("font-size", 11)
    .attr("font-weight", 700)
    .text("Positive");

  const legend = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${height - 14})`);

  const item = legend
    .selectAll("g")
    .data(likertLevels)
    .join("g")
    .attr("transform", (d, i) => `translate(${i * 155},0)`);

  item
    .append("rect")
    .attr("width", 14)
    .attr("height", 14)
    .attr("y", -12)
    .attr("fill", (d) => likertColors.get(d));

  item
    .append("text")
    .attr("x", 20)
    .attr("y", 0)
    .attr("dominant-baseline", "middle")
    .attr("font-size", 12)
    .text((d) => d);

  mount.appendChild(svg.node());
}