sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/SearchField",
    "sap/m/Dialog",
    "sap/m/List",
    "sap/m/StandardListItem",
	"sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
	"sap/ui/core/Fragment",
	"sap/m/MessageBox"
], function(Controller, SearchField, Dialog, List, StandardListItem,ODataModel,JSONModel,Fragment,MessageBox) {
    "use strict";

    const sURL = "/V2/Northwind/Northwind.svc/";
    var articoloAggiunto = false;

    return Controller.extend("project1.controller.View1", {
        onInit: function () {

            const oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteView1").attachPatternMatched(this.onRouteMatched, this);


        },

        onRouteMatched: async function(oEvent) {

          var oCartModel = new JSONModel({ 
            cartCount: 0,
            cartItems: []
           });

          this.getView().setModel(oCartModel, "cart");

			var oModel = new ODataModel(sURL);

			const oData = await new Promise((resolve, reject) => {
				oModel.read("/Products" , {
					filters: [new sap.ui.model.Filter("UnitsInStock", sap.ui.model.FilterOperator.GT, '0')],
					success: function(oData, response) {
            oData.results.forEach(product => {
              product.AddEnabled = true;
              product.RemoveEnabled = false;})
						resolve(oData);
					  },
					  error: function(error) {
						  reject(error);
					  }
				  });
			  });
			
			//this.getView().setModel(new JSONModel(oData.results), "modProducts");

      var oModelCity = new ODataModel(sURL);

            const oDataCity = await new Promise((resolve, reject) => {
              oModelCity.read("/Suppliers", {
              success: function(oDataCity, response) {
                resolve(oDataCity);
              },
              error: function(error) {
              }
        });
    });

    var aProducts = oData.results;
    var aCities = oDataCity.results;

    aProducts.forEach(function (product) {
        var oSupplier = aCities.find(function (city) {
            return city.SupplierID === product.SupplierID;
        });
        product.City = oSupplier ? oSupplier.City : "";
        product.AddEnabled = true;
        product.RemoveEnabled = false;
    
    //this.getView().setModel(new JSONModel(oDataCity.results), "modCity");

  });

  this.getView().setModel(new JSONModel(aProducts), "modProducts");
  this.getView().setModel(new JSONModel(aCities), "modCity");

    

    // NO this.getView().getModel("modProducts").setData(oDataCity.results);


      //var aSupplierIDs = [...new Set(oData.results.map(product => product.SupplierID))];
    
      //var aFilters = aSupplierIDs.map(new sap.ui.model.Filter("SupplierID", sap.ui.model.FilterOperator.EQ, SupplierID));

      /*const oSupplierData = await new Promise((resolve, reject) => {
      oModel.read("/Suppliers", {
        filters: [new sap.ui.model.Filter("SupplierID", sap.ui.model.FilterOperator.EQ, aSupplierIDs.SupplierID)],
        success: function(oData, response) {
          resolve(oData);
        },
        error: function(error) {
          reject(error);
        }
      });
    });

      this.getView().setModel(new JSONModel(oSupplierData.results), "modCity");*/


            },
        
        /*chiamataCity: async function(){

          var oModel = new ODataModel("/V2/Northwind/Northwind.svc/");

          const oData = await new Promise((resolve, reject) => {
            oModel.read("/Suppliers" , {
              filters: [new sap.ui.model.Filter("SupplierID", sap.ui.model.FilterOperator.EQ , '0')],
              success: function(oData, response) {
                resolve(oData);
                },
                error: function(error) {
                  reject(error);
                }
              });
            });
          
            this.getView().setModel(new JSONModel(oData.results), "modCity");
        },*/

        /*chiamataCity: async function(){
          var oModel = this.getView().getModel("modProducts");
          var lunghezzaModello = this.getView().getModel("modProducts").getData().length;
          var cityArr = [lunghezzaModello];

          for(var i = 0; i < lunghezzaModello ; i++){
            cityArr[i] = this.getView().getModel("modProducts").getData()[i].SupplierID;
          }

          //var aProducts = oModel.getProperty("SuppliersID");
          //var aSupplierIDs = aProducts.map(product => product.SupplierID);

          //if (aSupplierIDs.length > 0) {

            var sSupplierIDFilter = aSupplierIDs.join(',');

            var oModelCity = new ODataModel(sURL);

            const oData = await new Promise((resolve, reject) => {
              oModelCity.read("/Suppliers", {
              filters: [new sap.ui.model.Filter("SupplierID", sap.ui.model.FilterOperator.EQ, cityArr)],
              success: function(oData, response) {
                resolve(oData);
              },
              error: function(error) {
              }


        });
    });

            this.getView().setModel(new JSONModel(oData.results), "modCity");
        },*/

      

        onAdd: function(oEvent) {
          var oButton = oEvent.getSource();
          var oContext = oButton.getBindingContext("modProducts");
          var oModel = this.getView().getModel("modProducts");
          var sPath = oContext.getPath();

          
          /* var oCartData = oCartModel.getData();
          oCartData.cartItems.push(oContext);*/
          
          // var cartItems = oCartModel.getProperty("/cartItems");
          //this.getView().getModel("oCartModel").setProperty("/cartItems" , cartItems , oContext )
          
          oModel.setProperty(sPath + "/AddEnabled", false);
          oModel.setProperty(sPath + "/RemoveEnabled", true);
          
          var oCartModel = this.getView().getModel("cart");
          var cartCount = oCartModel.getProperty("/cartCount");
          oCartModel.setProperty("/cartCount", cartCount + 1);
          
          var tmp = oContext.getObject();
          oCartModel.setProperty("/cartItems" + cartCount , tmp );
          //oCartModel.setData(oCartData);

          var oCartItems = oCartModel.getProperty("/cartItems");
          var oProduct = oContext.getObject();

          if (oProduct && oProduct.ProductName) {
            oCartItems.push(oProduct);
    }
    oCartModel.setProperty("/cartItems", oCartItems);
      },

        onRemove: function(oEvent) {
          var oButton = oEvent.getSource();
          var oContext = oButton.getBindingContext("modProducts");
          var oModel = this.getView().getModel("modProducts");
          var sPath = oContext.getPath();

          oModel.setProperty(sPath + "/AddEnabled", true);
          oModel.setProperty(sPath + "/RemoveEnabled", false);

          var oCartModel = this.getView().getModel("cart");
          var cartCount = oCartModel.getProperty("/cartCount");
          oCartModel.setProperty("/cartCount", cartCount - 1);

          var tmp = oContext.getObject();
          oCartModel.setProperty("/cartItems" + cartCount , tmp );
      },

        /*onAdd: function(oEvent){
           // var oSelectedItem = oEvent.getBindingContext("modProducts").getObject();
            articoloAggiunto = true;
            var oButton = oEvent.getSource().setProperty("enabled" , false);
            oButton.setEnabled(false);
            var selectedRigaProducts = oSelectedItem.getBindingContext("modProducts").getObject();
            //this.getView().byId("removeButton").setEnabled(true);
        },

        onRemove: function(oEvent){
            
            articoloAggiunto = true;
            var oButton = oEvent.getSource();
            oButton.setEnabled(false);
            this.getView().byId("addButton").setEnabled(true);
            
        },*/

        onContinue: function() {
          var oCartModel = this.getView().getModel("cart");
          var cartCount = oCartModel.getProperty("/cartCount");

          const newData = btoa(JSON.stringify(this.getView().getModel("cart").getData()));

          // btoa(JSON.stringify(this.getView().getModel("modCity").getData())); // 2 modelli uno per i prodotti e 1 per le città??

          if (cartCount === 0) {
              MessageBox.error("Il carrello è vuoto.");
          } else {
              var oRouter = this.getOwnerComponent().getRouter();
              oRouter.navTo("RouteView2", {RouteView1:newData});
              sap.m.MessageToast.show(newData);
          }
      },


        formatPrice: function(value) {
          return parseFloat(value).toFixed(2);
        }

    });
});
