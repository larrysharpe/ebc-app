export type PlaceSearchResult = {
  id: string;
  /** Primary line — e.g. "Popeyes Louisiana Kitchen" */
  name: string;
  /** Full display label for the location field */
  label: string;
  /** City / area hint under the name */
  secondary?: string;
  lat?: number;
  lon?: number;
};
