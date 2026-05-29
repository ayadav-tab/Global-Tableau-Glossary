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
         if (tableau.extensions.settings.get("source"))
        {
            document.getElementById("source").value=tableau.extensions.settings.get("source");
        }
         if (tableau.extensions.settings.get("owner"))
        {
            document.getElementById("owner").value=tableau.extensions.settings.get("owner");
        }
         if (tableau.extensions.settings.get("refresh"))
        {
            document.getElementById("refresh").value=tableau.extensions.settings.get("refresh");
        }
         if (tableau.extensions.settings.get("techowner"))
        {
            document.getElementById("techowner").value=tableau.extensions.settings.get("techowner");
        }
         if (tableau.extensions.settings.get("department"))
        {
            document.getElementById("department").value=tableau.extensions.settings.get("department");
        }
          if (tableau.extensions.settings.get("staticfile"))
        {
            document.getElementById("staticfile").value=tableau.extensions.settings.get("staticfile");
        }
        

    });

});


function saveSettings() {
    let selectedSheet = document.getElementById("sheetDropdown").value;    
    tableau.extensions.settings.set("worksheet", selectedSheet);  
    tableau.extensions.settings.set("dashboard_name", document.getElementById("dashboard_name").value);  
    tableau.extensions.settings.set("source", document.getElementById("source").value);  
    tableau.extensions.settings.set("owner", document.getElementById("owner").value);  
    tableau.extensions.settings.set("refresh", document.getElementById("refresh").value); 
    tableau.extensions.settings.set("techowner", document.getElementById("techowner").value); 
    tableau.extensions.settings.set("department", document.getElementById("department").value); 
    tableau.extensions.settings.set("staticfile", document.getElementById("staticfile").value); 
    tableau.extensions.settings.saveAsync().then(() => {
        tableau.extensions.ui.closeDialog();
    });
}