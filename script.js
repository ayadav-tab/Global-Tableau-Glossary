(function () {
  let worksheet;
  $(document).ready(function () {
    tableau.extensions.initializeAsync().then(function () {
      loadSelectedSheet();
      document.getElementById("configure").addEventListener("click", openConfig);
      if (
        tableau.extensions.environment.mode ===
        tableau.ExtensionMode.Authoring
      ) {

        $('#configure').show();

      } else {

        $('#configure').hide();

      }
      function openConfig() {
        tableau.extensions.ui.displayDialogAsync(
          "config.html",
          "",
          { height: 300, width: 400 }
        );
      }
    }, function (err) {
      // Something went wrong in initialization.
      console.log('Error while Initializing: ' + err.toString());
    });

  });
  let all_rows;
  let footer_data;
  const dsBadgeClass = { "CRM": "ds-CRM", "LO": "ds-LO", "WD": "ds-WD", "Calculated Field": "ds-Calc", "Static Goal data": "ds-Static" };
  const dsLabel = { "LO": "Luminate Online", "WD": "Workday", "Calculated Field": "Calculated", "Static Goal data": "Static Goal", "CRM": "CRM" };


  let currentFilter = 'ALL',
    expandedRows = new Set(),
    groupExpanded = true;
  let searchtext = '';
  let selected_ds = 'All';
  window.searchbar = function () {
    searchtext = document.getElementById('metricSearch').value.toLowerCase();
    renderTable();
  }
  function filterrows() {
    return all_rows.filter(d => {
      const mBU = selected_ds === "all" || d.Data_Source === selected_ds;
      const mSrch = !searchtext || d.KPI.toLowerCase().includes(searchtext) || d.Data_Source.toLowerCase().includes(searchtext);
      const mSrc = !searchtext || d.Business_Definition.includes(searchtext);
      return mBU && mSrch && mSrc;
    });
  }
  window.setFilter = function (f, el) {
    selected_ds = f.toLowerCase();
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
    renderTable();
  }
  async function loadSelectedSheet() {
    const sheetName = tableau.extensions.settings.get("worksheet");

    if (!sheetName) {
      console.log("No sheet selected yet");
      return;
    }
    // $('.sheetname')[0].textContent = sheetName;
    worksheet = tableau.extensions.dashboardContent.dashboard.worksheets
      .find(ws => ws.name === sheetName);

    if (!worksheet) {
      console.error("Worksheet not found:", sheetName);
      return;
    }
    $('#dashboard_name')[0].innerHTML = tableau.extensions.settings.get("dashboard_name");
    $('#source').text(tableau.extensions.settings.get("source"));
    $('#major_source').text(tableau.extensions.settings.get("source"));
    $('#owner').text(tableau.extensions.settings.get("owner"));
    $('#techowner').text(tableau.extensions.settings.get("techowner"));
    $('#department').text(tableau.extensions.settings.get("department"));
    $('#refresh')[0].innerHTML = tableau.extensions.settings.get("refresh");
    $('#refresh_div')[0].innerHTML = tableau.extensions.settings.get("refresh");
    $('#staticfile')[0].innerHTML = tableau.extensions.settings.get("staticfile");
    // console.log("Loaded worksheet:", sheetName);
    //if (sheetName) { $('#configure').hide(); }

    await loadData();  // 👈 call your data function


  }
  async function loadData() {
    worksheet.getSummaryDataAsync().then(function (sumdata) {
      all_rows = tableauToJson(sumdata);
      renderTable();
      const distinctDataSources = [
        ...new Set(
          all_rows
            .map(x => x.Data_Source)
            .filter(x => x != null && x !== '' && !x.toLowerCase().includes('null'))
        )
      ];
      document.getElementById('source_count').textContent = distinctDataSources.length;
      let ds_html = '<div class="chip active" onclick="setFilter(&#39;ALL&#39;,this)">All</div>';
      distinctDataSources.forEach(ds => {
        ds_html += `<div class="chip" onclick="setFilter('${ds}',this)">${ds}</div>`
      });
      document.getElementById('ds_list').innerHTML=ds_html;
    });
  }
  function tableauToJson(sumdata) {

    return sumdata.data.map(row => {

      let obj = {};

      sumdata.columns.forEach((col, index) => {

        obj[col.fieldName] = row[index]?.value;
        obj[col.fieldName + "_formatted"] = row[index]?.formattedValue;

      });

      return obj;
    });
  }

  function toggleRow(idx) {
    const tbody = document.getElementById('tableBody');
    const btn = tbody.querySelector('.expand-btn[data-btn="' + idx + '"]');
    const dtr = tbody.querySelector('tr[data-detail="' + idx + '"]');
    const mtr = tbody.querySelector('tr[data-idx="' + idx + '"]');
    if (expandedRows.has(idx)) {
      expandedRows.delete(idx); btn.classList.remove('open'); mtr.classList.remove('expanded'); dtr.style.display = 'none';
    } else {
      expandedRows.add(idx); btn.classList.add('open'); mtr.classList.add('expanded'); dtr.style.display = '';
    }
  }
  function toggleGroup(groupId) {

    const toggle = document.getElementById(`groupToggle${groupId}`);

    const isOpen = toggle.classList.contains('open');

    toggle.classList.toggle('open');

    toggle.style.color = isOpen
      ? "#0b1157"
      : "#ffff";

    document.querySelectorAll(`.group-${groupId}`)
      .forEach(r => {

        if (r.classList.contains('detail-row')) {

          const idx = parseInt(r.dataset.detail);

          r.style.display =
            (!isOpen && expandedRows.has(idx))
              ? ''
              : 'none';

        } else {

          r.style.display = isOpen
            ? 'none'
            : '';

        }

      });

  }

  function renderTable() {



    const tbody = document.getElementById('tableBody');

    tbody.innerHTML = '';
    let rows = filterrows();
    document.getElementById('totalCount').textContent = rows.length;
    document.getElementById('shownCount').textContent = rows.length;
    document.getElementById('totalmetrics').textContent = rows.length;

    let currentGroup = null;

    let groupCounter = -1;


    rows.forEach((row, i) => {

      const hasGroup =
        row.Tab &&
        row.Tab.trim() !== '' &&
        row.Tab !== 'undefined';


      /* CREATE GROUP HEADER */

      if (hasGroup && currentGroup !== row.Tab) {

        currentGroup = row.Tab;

        groupCounter++;

        const currentGroupId = groupCounter;

        const groupRow = document.createElement('tr');

        groupRow.className = 'group-row';

        groupRow.innerHTML = `
      <td colspan="4">

        <div class="group-header">

          <div class="group-toggle open"
               style="color:#FFFF"
              id="groupToggle${currentGroupId}">
            +
          </div>

          <div>

            <div class="group-title">
              ${row.Tab}
            </div>

          </div>

        </div>

      </td>
      `;

        groupRow.onclick = () => toggleGroup(currentGroupId);

        tbody.appendChild(groupRow);

      }


      /* NORMAL ROW */

      const cls = dsBadgeClass[row.Data_Source] || 'ds-Static';

      const lbl = dsLabel[row.Data_Source] || row.Data_Source;

      const tr = document.createElement('tr');

      tr.className = hasGroup
        ? `metric-row group-${groupCounter}`
        : 'metric-row';

      tr.dataset.idx = i;

      tr.onclick = () => toggleRow(i);

      tr.innerHTML = `
    <td style="padding:10px 10px 10px 20px">

      <div class="expand-btn"
           data-btn="${i}">
        +
      </div>

    </td>

    <td>
      <div class="metric-name">
        ${row.KPI}
      </div>
    </td>

    <td>
      <span class="ds-badge ${cls}">
        ${lbl}
      </span>
    </td>

    <td style="color:var(--dgray);line-height:1.5;font-size:14px">
      ${row.Business_Definition}
    </td>
    `;

      tbody.appendChild(tr);


      /* DETAIL ROW */

      const dtr = document.createElement('tr');

      dtr.dataset.detail = i;

      dtr.className = hasGroup
        ? `detail-row group-${groupCounter}`
        : 'detail-row';

      dtr.style.display = 'none';

      dtr.innerHTML = `
    <td colspan="4" style="padding:0">

      <div class="detail-panel">

        <div class="detail-box">

          <div class="d-label">

            <span class="d-dot"
                  style="background:var(--blue)">
            </span>

            Calculation logic

          </div>

          <div class="calc-block">
            ${row.Calculation}
          </div>

        </div>

        <div class="detail-box">

          <div class="d-label">

            <span class="d-dot"
                  style="background:#0B6E56">
            </span>

            Data source

          </div>

          <div style="margin-bottom:10px">

            <span class="ds-badge ${cls}">
              ${row.Data_Source}
            </span>

          </div>

          <div class="d-label" style="margin-top:8px">

            <span class="d-dot"
                  style="background:#6B0080">
            </span>

            Business definition

          </div>

          <div class="d-text">
            ${row.Business_Definition}
          </div>

        </div>

      </div>

    </td>
    `;

      tbody.appendChild(dtr);

    });
  }
})();