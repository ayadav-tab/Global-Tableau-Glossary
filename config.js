let worksheets;

$(document).ready(function () {

    tableau.extensions.initializeDialogAsync().then(() => {

        const dashboard = tableau.extensions.dashboardContent.dashboard;
        const worksheets = dashboard.worksheets;
       // alert(dashboard.name)
        const dropdown = document.getElementById("sheetDropdown");

        dropdown.innerHTML = ""; // clear first

        worksheets.forEach(ws => {
            let option = document.createElement("option");
            option.value = ws.name;
            option.text = ws.name;
            dropdown.appendChild(option);
        });
       
        if (tableau.extensions.settings.get("worksheet"))
        {
            dropdown.value=tableau.extensions.settings.get("worksheet");
        }
         if (tableau.extensions.settings.get("dashboard_name"))
        {
            document.getElementById("dashboard_name").value=tableau.extensions.settings.get("dashboard_name");
        }
        

    });

});


function saveSettings() {
    let selectedSheet = document.getElementById("sheetDropdown").value;    
    tableau.extensions.settings.set("worksheet", selectedSheet);  
    tableau.extensions.settings.set("dashboard_name", document.getElementById("dashboard_name").value);    
    tableau.extensions.settings.saveAsync().then(() => {
        tableau.extensions.ui.closeDialog();
    });
}