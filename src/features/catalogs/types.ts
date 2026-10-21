export type CatalogOption = {
  id: string;
  name: string;
};

export type Catalogs = {
  event_types: CatalogOption[];
  client_sources: CatalogOption[];
  event_statuses: CatalogOption[];
  communication_channels: CatalogOption[];
  event_hour_times: CatalogOption[];
  bihor_localities: CatalogOption[];
};
