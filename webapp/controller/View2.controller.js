sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/SearchField",
    "sap/m/Dialog",
    "sap/m/List",
    "sap/m/StandardListItem",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox",
    "sap/ui/export/Spreadsheet"
], function(Controller, SearchField, Dialog, List, StandardListItem,ODataModel,JSONModel,Fragment,MessageBox,Spreadsheet) {
    "use strict";

    const sURL = "/V2/Northwind/Northwind.svc/";

    return Controller.extend("project1.controller.View2", {

        onInit: function(){

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteView2").attachPatternMatched(this.onRouteMatched, this);

            this.getView().setModel(new JSONModel({ TotalPrice: "0.00" }), "modPrezzoTotale");


        },

        onRouteMatched: function(oEvent){

            const datiCodificati = JSON.parse(atob(oEvent.getParameter("arguments").RouteView1));
            const newModCart = new JSONModel(datiCodificati);
            this.getView().setModel(newModCart, "newModCart");

            if (datiCodificati.cartItems) {
                datiCodificati.cartItems.forEach(function(item) {
                    if (!item.Quantity) {
                        item.Quantity = 1;
                    }
                });
            }

            this.calculateTotalPrice();

        },

        calculateTotalPrice: function() {
            var oModel = this.getView().getModel("newModCart");
            var cartItems = oModel.getProperty("/cartItems") || [];
            var totalPrice = cartItems.reduce(function(sum, item) {
            var unitPrice = parseFloat(item.UnitPrice) || 0;
            var quantity = parseFloat(item.Quantity) || 1;
                return sum + (unitPrice * quantity);
                
            }, 0);
            this.getView().getModel("modPrezzoTotale").setProperty("/TotalPrice", totalPrice.toFixed(2));
        },

        /*calculateTotalPrice: function() {
            var oModel = this.getView().getModel("newModCart");
            var cartItems = oModel.getProperty("/cartItems") || [];
            var totalPrice = cartItems.reduce(function(sum, item) {
                var unitPrice = parseFloat(item.UnitPrice) || 0;
                var quantity = parseFloat(item.Quantity) || 0;
                return sum + (unitPrice * quantity);
            }, 0);
            this.getView().getModel("modPrezzoTotale").setProperty("/TotalPrice", totalPrice.toFixed(2));
        },*/

       /*calculateTotalPrice: function() { //preso da altro esercizio Testare

            var oInput = oEvent.getSource();
            var prezzoUnita = parseFloat(oInput.getBindingContext().getProperty("UnitPrice"));
            var quantita = oEvent.getParameter("value");
            var prezzoTotale = prezzoUnita * quantita;
          
            var oModel = oInput.getModel("newModcart");
          
            var sPath = oInput.getBindingContext().getPath();
      
            this.getView().setModel(new JSONModel("prezzoTotale"), "modPrezzoTotale");
      
            oModel.setProperty(sPath + "TotalPrice", prezzoTotale.toFixed(2));
          },*/

        unioneModelli: async function(){
            
           /* var aProducts = getModel("modProducts").getProperty("/Products");
            var aSuppliers = getModel("modCity").getProperty("/SupplierID");

            var combinedData = [];

            aSuppliers.forEach(function(SupplierID){

                var aSupplierToProducts = aProducts.filter
            }
            
            
            )*/

            var aFilters = [];
                aFilters.push(
                    new Filter("UnitsInStock" , FilterOperator.GT , "0")
                )
            
                const oProdMod = await this.oDataRead(sURL , "/Products" , aFilter);
                oProdMod.results.forEach(prod =>{})
        },
  
        onQuantityChange: function(oEvent) {
            var oInput = oEvent.getSource();
            var newValue = oEvent.getParameter("value");
            var oContext = oInput.getBindingContext("newModCart");
            var oModel = oContext.getModel("newModCart");

            var sPath = oContext.getPath();
            var oProduct = oModel.getProperty(sPath);
            var prezzoUnita = oProduct.UnitPrice;
            var prezzoTotale = prezzoUnita * newValue;
            
            oModel.setProperty(sPath + "/Quantity", newValue);
            oModel.setProperty(sPath + "/TotalPrice", prezzoTotale.toFixed(2));

            //this.getView().setModel(new JSONModel("prezzoTotale"), "modPrezzoTotale");

            this.calculateTotalPrice();
        },

        onExport: function() {
            var oModel = this.getView().getModel("newModCart");
            var oData = oModel.getProperty("/cartItems");

            var aCols = [
                { label: "Product Name", property: "ProductName", type: "string" },
                { label: "Quantity per unit", property: "QuantityPerUnit", type: "string" },
                { label: "Unit price", property: "UnitPrice", type: "number" },
                { label: "Shipping from", property: "City", type: "string" },
                { label: "Quantity", property: "Quantity", type: "number" }
                //{ label: "Total Price", property: "TotalPrice", type: "number" }
            ];

            var oSettings = {
                workbook: { columns: aCols },
                dataSource: oData,
                fileName: "Cart.xlsx"
            };

            var oSheet = new Spreadsheet(oSettings);
            oSheet.build()
                .then(() => {
                    MessageBox.success("File salvato");
                })
                .finally(oSheet.destroy);
        },

        onConfirm: function() {
            MessageBox.success("Ordine confermato!");
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteView1");
        },

        formatPrice: function(value) {
            return parseFloat(value).toFixed(2);
          }
    });
});
