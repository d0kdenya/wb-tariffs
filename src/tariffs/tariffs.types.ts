export interface WbBoxWarehouseItem {
  boxDeliveryAndStorageExpr?: string;
  boxDeliveryBase?: string;
  boxDeliveryCoefExpr?: string;
  boxDeliveryLiter?: string;

  boxDeliveryMarketplaceBase?: string;
  boxDeliveryMarketplaceCoefExpr?: string;
  boxDeliveryMarketplaceLiter?: string;

  boxStorageBase?: string;
  boxStorageCoefExpr?: string;
  boxStorageLiter?: string;

  geoName?: string;
  warehouseName: string;
}

export interface WbBoxResponse {
  response: {
    data: {
      dtNextBox?: string;
      dtTillMax?: string;
      warehouseList: WbBoxWarehouseItem[];
    };
  };
}
