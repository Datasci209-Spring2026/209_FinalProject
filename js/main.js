// import { renderChart1 } from "./chart1.js";
import { renderChart2 } from "./chart2.js";
import { renderChart3 } from "./chart3.js";
import { renderChart4 } from "./chart4.js";
import { renderChart5 } from "./chart5.js";
import { renderChart5v2 } from "./chart5_v2.js";
import { renderChart6 } from "./chart6.js";
import { renderChart7 } from "./chart7.js";
import { renderLikertChart } from "./likert.js";

const activeTab = new URL(import.meta.url).searchParams.get("tab");

// load US atlas JSON for charts 6/7
const usAtlas = await d3.json(
  "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"
);

// state abbreviation and name lookup
const stateNameLookup = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming"
};

// state abbrevation to FIPS
const stateAbbrevToFips = {
  AL: "01",
  AK: "02",
  AZ: "04",
  AR: "05",
  CA: "06",
  CO: "08",
  CT: "09",
  DE: "10",
  DC: "11",
  FL: "12",
  GA: "13",
  HI: "15",
  ID: "16",
  IL: "17",
  IN: "18",
  IA: "19",
  KS: "20",
  KY: "21",
  LA: "22",
  ME: "23",
  MD: "24",
  MA: "25",
  MI: "26",
  MN: "27",
  MS: "28",
  MO: "29",
  MT: "30",
  NE: "31",
  NV: "32",
  NH: "33",
  NJ: "34",
  NM: "35",
  NY: "36",
  NC: "37",
  ND: "38",
  OH: "39",
  OK: "40",
  OR: "41",
  PA: "42",
  RI: "44",
  SC: "45",
  SD: "46",
  TN: "47",
  TX: "48",
  UT: "49",
  VT: "50",
  VA: "51",
  WA: "53",
  WV: "54",
  WI: "55",
  WY: "56"
};

// source order for all energy sources
const sourceOrder = [
  "Solar",
  "Wind",
  "Hydro - Conventional",
  "Hydro Pumped Storage",
  "Geothermal",
  "Other Renewables",
  "Nuclear",
  "Coal",
  "Natural Gas",
  "Other Gas",
  "Landfill Gas",
  "Petroleum Coke",
  "Distillate Fuel Oil (Diesel)",
  "Residual Fuel Oil",
  "Wood / Biomass",
  "Municipal Solid Waste",
  "Other / Unknown"
];

// source order for grouped energy sources
const simpleSourceOrder = [
  "Solar",
  "Wind",
  "Hydro",
  "Nuclear",
  "Coal",
  "Natural Gas",
  "Other"
];

// defined Tableau 20 color palate to enrergy source map
const energyColors = {
  "Solar": "#F28E2B",
  "Wind": "#8CD17D",
  "Hydro - Conventional": "#4E79A7",
  "Hydro Pumped Storage": "#A0CBE8",
  "Geothermal": "#59A14F",
  "Other Renewables": "#FFBE7D",
  "Nuclear": "#F1CE63",
  "Coal": "#E15759",
  "Natural Gas": "#D4A6C8",
  "Other Gas": "#499894",
  "Landfill Gas": "#86BCB6",
  "Petroleum Coke": "#B6992D",
  "Distillate Fuel Oil (Diesel)": "#FF9D9A",
  "Residual Fuel Oil": "#B07AA1",
  "Wood / Biomass": "#D7B5A6",
  "Municipal Solid Waste": "#9D7660",
  "Other / Unknown": "#79706E"
};

// defined Tablea 20 color palate to grouped energy source map
const simpleEnergyColors = {
  "Solar": "#F28E2B",
  "Wind": "#8CD17D",
  "Hydro": "#4E79A7",
  "Nuclear": "#F1CE63",
  "Coal": "#E15759",
  "Natural Gas": "#D4A6C8",
  "Other": "#79706E"
};

function parseEnergyRow(d) {
  return {
    ...d,
    report_date: new Date(d.report_date),
    net_generation_mwh:
      d.net_generation_mwh == null || d.net_generation_mwh === ""
        ? 0
        : +d.net_generation_mwh
  };
}

function parsePlantRow(d) {
  return {
    ...d,
    report_year: +d.report_year,
    latitude: d.latitude == null || d.latitude === "" ? null : +d.latitude,
    longitude: d.longitude == null || d.longitude === "" ? null : +d.longitude,
    total_generation_mwh:
      d.total_generation_mwh == null || d.total_generation_mwh === ""
        ? null
        : +d.total_generation_mwh,
    installed_capacity_mw:
      d.installed_capacity_mw == null || d.installed_capacity_mw === ""
        ? null
        : +d.installed_capacity_mw
  };
}

async function init() {
  // Supplemental tab only needs the Likert chart
  if (activeTab === "supplemental-visualizations") {
    renderLikertChart({
      container: "#likert-chart"
    });
    return;
  }

  const energyData = await d3.csv(
    "data/eia_monthly_generation_by_source.csv",
    parseEnergyRow
  );

  const dataState = await d3.csv(
    "data/eia_monthly_generation_by_state_by_source.csv",
    parseEnergyRow
  );

  const plantYearData = await d3.csv(
    "data/eia_plant_year_dominant_source_2001_2024.csv",
    parsePlantRow
  );

  const stackedInputYearly = (() => {
    const byYear = d3.rollup(
      energyData,
      (v) =>
        Object.fromEntries(
          sourceOrder.map((source) => [
            source,
            d3.sum(
              v.filter((d) => d.energy_source_group === source),
              (d) => d.net_generation_mwh || 0
            )
          ])
        ),
      (d) => d3.utcYear.floor(d.report_date)
    );

    return Array.from(byYear, ([date, values]) => ({
      report_date: date,
      ...values
    }))
      .filter((d) => d.report_date <= new Date("2024-12-31"))
      .sort((a, b) => d3.ascending(a.report_date, b.report_date));
  })();

  const groupedEnergyData = energyData.map((d) => ({
    ...d,
    energy_source_group_simple:
      d.fuel_type_code_agg === "SUN"
        ? "Solar"
        : d.fuel_type_code_agg === "WND"
        ? "Wind"
        : ["HYC", "HPS"].includes(d.fuel_type_code_agg)
        ? "Hydro"
        : d.fuel_type_code_agg === "NUC"
        ? "Nuclear"
        : d.fuel_type_code_agg === "COL"
        ? "Coal"
        : d.fuel_type_code_agg === "NG"
        ? "Natural Gas"
        : "Other"
  }));

  const stackedInputYearlySimple = (() => {
    const filtered = groupedEnergyData.filter(
      (d) => d.report_date <= new Date("2024-12-31")
    );

    const byYear = d3.rollup(
      filtered,
      (v) =>
        Object.fromEntries(
          simpleSourceOrder.map((source) => [
            source,
            d3.sum(
              v.filter((d) => d.energy_source_group_simple === source),
              (d) => d.net_generation_mwh || 0
            )
          ])
        ),
      (d) => d3.utcYear.floor(d.report_date)
    );

    return Array.from(byYear, ([date, values]) => ({
      report_date: date,
      ...values
    })).sort((a, b) => d3.ascending(a.report_date, b.report_date));
  })();

  const annualSimpleData = (() => {
    const filtered = groupedEnergyData.filter(
      (d) => d.report_date <= new Date("2024-12-31")
    );

    const rolled = d3.rollups(
      filtered,
      (v) => d3.sum(v, (d) => d.net_generation_mwh || 0),
      (d) => d.energy_source_group_simple,
      (d) => d3.utcYear.floor(d.report_date)
    );

    const result = [];

    for (const [source, yearValues] of rolled) {
      for (const [year, value] of yearValues) {
        result.push({
          source,
          report_date: year,
          year: d3.utcFormat("%Y")(year),
          net_generation_mwh: value
        });
      }
    }

    return result.sort(
      (a, b) =>
        d3.ascending(
          simpleSourceOrder.indexOf(a.source),
          simpleSourceOrder.indexOf(b.source)
        ) || d3.ascending(a.report_date, b.report_date)
    );
  })();

  const cagrSimpleData = (() => {
    const bySource = d3.group(annualSimpleData, (d) => d.source);

    return simpleSourceOrder.map((source) => {
      const values = (bySource.get(source) || []).sort((a, b) =>
        d3.ascending(a.report_date, b.report_date)
      );

      const first = values[0];
      const last = values[values.length - 1];

      let cagr = null;

      if (first && last && first.net_generation_mwh > 0) {
        const startYear = +d3.utcFormat("%Y")(first.report_date);
        const endYear = +d3.utcFormat("%Y")(last.report_date);
        const n = endYear - startYear;

        if (n > 0) {
          cagr =
            Math.pow(last.net_generation_mwh / first.net_generation_mwh, 1 / n) - 1;
        }
      }

      return {
        source,
        start_value_mwh: first?.net_generation_mwh ?? null,
        end_value_mwh: last?.net_generation_mwh ?? null,
        cagr
      };
    });
  })();

  const groupedStateData = dataState.map((d) => ({
    ...d,
    energy_source_group_simple:
      d.fuel_type_code_agg === "SUN"
        ? "Solar"
        : d.fuel_type_code_agg === "WND"
        ? "Wind"
        : ["HYC", "HPS"].includes(d.fuel_type_code_agg)
        ? "Hydro"
        : d.fuel_type_code_agg === "NUC"
        ? "Nuclear"
        : d.fuel_type_code_agg === "COL"
        ? "Coal"
        : d.fuel_type_code_agg === "NG"
        ? "Natural Gas"
        : "Other"
  }));

  const top9States = (() => {
    const filtered = groupedStateData.filter(
      (d) => d.report_date <= new Date("2024-12-31")
    );

    return d3
      .rollups(
        filtered,
        (v) => d3.sum(v, (d) => d.net_generation_mwh || 0),
        (d) => d.state
      )
      .sort((a, b) => d3.descending(a[1], b[1]))
      .slice(0, 9)
      .map((d) => d[0]);
  })();

  const annualStateSimpleData = (() => {
    const filtered = groupedStateData.filter(
      (d) =>
        d.report_date <= new Date("2024-12-31") && top9States.includes(d.state)
    );

    const rolled = d3.rollups(
      filtered,
      (v) => d3.sum(v, (d) => d.net_generation_mwh || 0),
      (d) => d.state,
      (d) => d.energy_source_group_simple,
      (d) => d3.utcYear.floor(d.report_date)
    );

    const result = [];

    for (const [state, sourceValues] of rolled) {
      for (const [source, yearValues] of sourceValues) {
        for (const [year, value] of yearValues) {
          result.push({
            state,
            source,
            report_date: year,
            net_generation_mwh: value
          });
        }
      }
    }

    return result.sort(
      (a, b) =>
        d3.ascending(top9States.indexOf(a.state), top9States.indexOf(b.state)) ||
        d3.ascending(a.report_date, b.report_date) ||
        d3.ascending(
          simpleSourceOrder.indexOf(a.source),
          simpleSourceOrder.indexOf(b.source)
        )
    );
  })();

  const stackedStateData = (() => {
    const nested = d3.group(annualStateSimpleData, (d) => d.state);

    return top9States.map((state) => {
      const rows = nested.get(state) || [];

      const byYear = d3.rollup(
        rows,
        (v) =>
          Object.fromEntries(
            simpleSourceOrder.map((source) => [
              source,
              d3.sum(
                v.filter((d) => d.source === source),
                (d) => d.net_generation_mwh || 0
              )
            ])
          ),
        (d) => +d.report_date
      );

      const values = Array.from(byYear, ([dateMs, vals]) => ({
        report_date: new Date(dateMs),
        ...vals
      })).sort((a, b) => d3.ascending(a.report_date, b.report_date));

      return { state, values };
    });
  })();

  const statesSorted = Array.from(
    new Set(groupedStateData.map((d) => d.state).filter(Boolean))
  ).sort((a, b) => d3.ascending(stateNameLookup[a] || a, stateNameLookup[b] || b));

  function getSelectedStateAnnualData(selectedState) {
    const filtered = groupedStateData.filter(
      (d) => d.state === selectedState && d.report_date <= new Date("2024-12-31")
    );

    const byYear = d3.rollup(
      filtered,
      (v) =>
        Object.fromEntries(
          simpleSourceOrder.map((source) => [
            source,
            d3.sum(
              v.filter((d) => d.energy_source_group_simple === source),
              (d) => d.net_generation_mwh || 0
            )
          ])
        ),
      (d) => +d3.utcYear.floor(d.report_date)
    );

    return Array.from(byYear, ([dateMs, values]) => ({
      report_date: new Date(dateMs),
      ...values
    })).sort((a, b) => d3.ascending(a.report_date, b.report_date));
  }

  const selectedStateSelect = document.getElementById("selectedState");
  const selectedStateLeftSelect = document.getElementById("selectedStateLeft");
  const selectedStateRightSelect = document.getElementById("selectedStateRight");
  const selectedSourceSelect = document.getElementById("selectedSource");
  const selectedYearInput = document.getElementById("selectedYear");
  const selectedYearValue = document.getElementById("selectedYearValue");
  const selectedPlantSourceSelect = document.getElementById("selectedPlantSource");
  const selectedPlantYearInput = document.getElementById("selectedPlantYear");
  const selectedPlantYearValue = document.getElementById("selectedPlantYearValue");

  statesSorted.forEach((state) => {
    const option = document.createElement("option");
    option.value = state;
    option.textContent = stateNameLookup[state] || state;
    if (state === "TX") option.selected = true;
    selectedStateSelect.appendChild(option);
  });

  statesSorted.forEach((state) => {
    const optionLeft = document.createElement("option");
    optionLeft.value = state;
    optionLeft.textContent = stateNameLookup[state] || state;
    if (state === "TX") optionLeft.selected = true;
    selectedStateLeftSelect.appendChild(optionLeft);

    const optionRight = document.createElement("option");
    optionRight.value = state;
    optionRight.textContent = stateNameLookup[state] || state;
    if (state === "CA") optionRight.selected = true;
    selectedStateRightSelect.appendChild(optionRight);
  });

  simpleSourceOrder.forEach((source) => {
    const option = document.createElement("option");
    option.value = source;
    option.textContent = source;
    if (source === "Solar") option.selected = true;
    selectedSourceSelect.appendChild(option);
  });

  simpleSourceOrder.forEach((source) => {
    const option = document.createElement("option");
    option.value = source;
    option.textContent = source;
    if (source === "Solar") option.selected = true;
    selectedPlantSourceSelect.appendChild(option);
  });

  const choroplethData = (() => {
    const filtered = groupedStateData.filter(
      (d) =>
        d.report_date <= new Date("2024-12-31") &&
        d.report_date >= new Date("2001-01-01") &&
        d.state &&
        stateAbbrevToFips[d.state]
    );

    const rolled = d3.rollups(
      filtered,
      (v) => d3.sum(v, (d) => d.net_generation_mwh || 0),
      (d) => d.state,
      (d) => +d3.utcYear.floor(d.report_date).getUTCFullYear(),
      (d) => d.energy_source_group_simple
    );

    const result = [];

    for (const [state, years] of rolled) {
      for (const [year, sources] of years) {
        for (const source of simpleSourceOrder) {
          const match = sources.find((s) => s[0] === source);
          const mwh = match ? match[1] : 0;

          result.push({
            state,
            state_name: stateNameLookup[state] || state,
            fips: stateAbbrevToFips[state],
            year,
            source,
            net_generation_mwh: mwh,
            net_generation_twh: mwh / 1e6
          });
        }
      }
    }

    return result;
  })();

  const choroplethLookup = new Map(
    choroplethData.map((d) => [`${d.fips}-${d.year}-${d.source}`, d])
  );

  function getChoroplethColorScale(selectedSource, selectedYear) {
    const values = choroplethData
      .filter((d) => d.source === selectedSource && d.year === selectedYear)
      .map((d) => d.net_generation_twh);

    const maxValue = d3.max(values) || 1;
    const base = d3.color(simpleEnergyColors[selectedSource]);

    const light = d3.interpolateRgb("#f0f0f0", base)(0.4);
    const dark = d3.interpolateRgb("#f0f0f0", base)(1.0);

    return d3
      .scaleQuantize()
      .domain([0, maxValue])
      .range(d3.quantize(d3.interpolateRgb(light, dark), 6));
  }

  function getChart7Data(selectedPlantYear, selectedPlantSource) {
    return plantYearData.filter(
      (d) =>
        d.report_year === selectedPlantYear &&
        d.dominant_energy_group === selectedPlantSource &&
        d.latitude != null &&
        d.longitude != null &&
        !isNaN(d.latitude) &&
        !isNaN(d.longitude) &&
        d.total_generation_mwh != null &&
        !isNaN(d.total_generation_mwh)
    );
  }

  function getChart7Radius(chart7Data) {
    return d3
      .scaleSqrt()
      .domain([0, d3.max(chart7Data, (d) => d.total_generation_mwh) || 1])
      .range([1.5, 14]);
  }

  renderChart2({
    container: "#chart2",
    stackedInputYearlySimple,
    simpleSourceOrder,
    simpleEnergyColors
  });

  renderChart3({
    container: "#chart3",
    annualSimpleData,
    cagrSimpleData,
    stackedInputYearlySimple,
    simpleSourceOrder,
    simpleEnergyColors
  });

  renderChart4({
    container: "#chart4",
    stackedStateData,
    simpleSourceOrder,
    simpleEnergyColors,
    stateNameLookup
  });

  function renderSingleStateChart() {
    const selectedState = selectedStateSelect.value;
    const selectedStateAnnualData = getSelectedStateAnnualData(selectedState);

    renderChart5({
      container: "#chart5",
      selectedState,
      selectedStateAnnualData,
      simpleSourceOrder,
      simpleEnergyColors,
      stateNameLookup
    });
  }

  function renderTwoStateChart() {
    const selectedStateLeft = selectedStateLeftSelect.value;
    const selectedStateRight = selectedStateRightSelect.value;

    const selectedStateAnnualDataLeft =
      getSelectedStateAnnualData(selectedStateLeft);
    const selectedStateAnnualDataRight =
      getSelectedStateAnnualData(selectedStateRight);

    const selectedStateSeriesLeft = d3
      .stack()
      .keys([...simpleSourceOrder].reverse())
      .offset(d3.stackOffsetNone)(selectedStateAnnualDataLeft);

    const selectedStateSeriesRight = d3
      .stack()
      .keys([...simpleSourceOrder].reverse())
      .offset(d3.stackOffsetNone)(selectedStateAnnualDataRight);

    renderChart5v2({
      container: "#chart5_v2",
      selectedStateLeft,
      selectedStateRight,
      selectedStateAnnualDataLeft,
      selectedStateAnnualDataRight,
      selectedStateSeriesLeft,
      selectedStateSeriesRight,
      statesSorted,
      simpleSourceOrder,
      simpleEnergyColors,
      stateNameLookup
    });
  }

  function renderStateMapChart() {
    const selectedSource = selectedSourceSelect.value;
    const selectedYear = +selectedYearInput.value;

    selectedYearValue.textContent = selectedYear;

    const choroplethColorScale = getChoroplethColorScale(
      selectedSource,
      selectedYear
    );

    renderChart6({
      container: "#chart6",
      usAtlas,
      choroplethLookup,
      choroplethColorScale,
      selectedSource,
      selectedYear,
      simpleSourceOrder,
      simpleEnergyColors
    });
  }

  function renderPlantMapChart() {
    const selectedPlantSource = selectedPlantSourceSelect.value;
    const selectedPlantYear = +selectedPlantYearInput.value;

    selectedPlantYearValue.textContent = selectedPlantYear;

    const chart7Data = getChart7Data(selectedPlantYear, selectedPlantSource);
    const chart7Radius = getChart7Radius(chart7Data);

    renderChart7({
      container: "#chart7",
      usAtlas,
      chart7Data,
      chart7Radius,
      selectedPlantSource,
      selectedPlantYear,
      simpleEnergyColors,
      stateNameLookup
    });
  }

  selectedStateSelect.addEventListener("change", renderSingleStateChart);
  selectedStateLeftSelect.addEventListener("change", renderTwoStateChart);
  selectedStateRightSelect.addEventListener("change", renderTwoStateChart);
  selectedSourceSelect.addEventListener("change", renderStateMapChart);
  selectedYearInput.addEventListener("input", renderStateMapChart);
  selectedPlantSourceSelect.addEventListener("change", renderPlantMapChart);
  selectedPlantYearInput.addEventListener("input", renderPlantMapChart);

  renderSingleStateChart();
  renderTwoStateChart();
  renderStateMapChart();
  renderPlantMapChart();
}

init();