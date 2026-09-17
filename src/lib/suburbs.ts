export type Region =
  | "Inner Brisbane"
  | "Northside"
  | "Southside"
  | "East"
  | "West";

export type Suburb = {
  name: string;
  region: Region;
  postcode: string;
};

/** Greater Brisbane residential service list — expand anytime. */
export const SUBURBS: Suburb[] = [
  // Inner
  { name: "Brisbane City", region: "Inner Brisbane", postcode: "4000" },
  { name: "South Brisbane", region: "Inner Brisbane", postcode: "4101" },
  { name: "West End", region: "Inner Brisbane", postcode: "4101" },
  { name: "Highgate Hill", region: "Inner Brisbane", postcode: "4101" },
  { name: "Kangaroo Point", region: "Inner Brisbane", postcode: "4169" },
  { name: "Fortitude Valley", region: "Inner Brisbane", postcode: "4006" },
  { name: "New Farm", region: "Inner Brisbane", postcode: "4005" },
  { name: "Teneriffe", region: "Inner Brisbane", postcode: "4005" },
  { name: "Spring Hill", region: "Inner Brisbane", postcode: "4000" },
  { name: "Paddington", region: "Inner Brisbane", postcode: "4064" },
  { name: "Red Hill", region: "Inner Brisbane", postcode: "4059" },
  { name: "Kelvin Grove", region: "Inner Brisbane", postcode: "4059" },
  { name: "Herston", region: "Inner Brisbane", postcode: "4006" },
  { name: "Bowen Hills", region: "Inner Brisbane", postcode: "4006" },
  // North
  { name: "Ascot", region: "Northside", postcode: "4007" },
  { name: "Hamilton", region: "Northside", postcode: "4007" },
  { name: "Clayfield", region: "Northside", postcode: "4011" },
  { name: "Hendra", region: "Northside", postcode: "4011" },
  { name: "Nundah", region: "Northside", postcode: "4012" },
  { name: "Wavell Heights", region: "Northside", postcode: "4012" },
  { name: "Chermside", region: "Northside", postcode: "4032" },
  { name: "Aspley", region: "Northside", postcode: "4034" },
  { name: "Kedron", region: "Northside", postcode: "4031" },
  { name: "Stafford", region: "Northside", postcode: "4053" },
  { name: "Everton Park", region: "Northside", postcode: "4053" },
  { name: "Mitchelton", region: "Northside", postcode: "4053" },
  { name: "Keperra", region: "Northside", postcode: "4054" },
  { name: "Ferny Grove", region: "Northside", postcode: "4055" },
  { name: "The Gap", region: "Northside", postcode: "4061" },
  { name: "Ashgrove", region: "Northside", postcode: "4060" },
  { name: "Bardon", region: "Northside", postcode: "4065" },
  { name: "Enoggera", region: "Northside", postcode: "4051" },
  { name: "Alderley", region: "Northside", postcode: "4051" },
  { name: "Newmarket", region: "Northside", postcode: "4051" },
  { name: "Wilston", region: "Northside", postcode: "4051" },
  { name: "Grange", region: "Northside", postcode: "4051" },
  { name: "Lutwyche", region: "Northside", postcode: "4030" },
  { name: "Windsor", region: "Northside", postcode: "4030" },
  { name: "Albion", region: "Northside", postcode: "4010" },
  { name: "Wooloowin", region: "Northside", postcode: "4030" },
  { name: "Northgate", region: "Northside", postcode: "4013" },
  { name: "Virginia", region: "Northside", postcode: "4014" },
  { name: "Geebung", region: "Northside", postcode: "4034" },
  { name: "Zillmere", region: "Northside", postcode: "4034" },
  { name: "Bracken Ridge", region: "Northside", postcode: "4017" },
  { name: "Sandgate", region: "Northside", postcode: "4017" },
  { name: "Shorncliffe", region: "Northside", postcode: "4017" },
  { name: "Brighton", region: "Northside", postcode: "4017" },
  // South
  { name: "Woolloongabba", region: "Southside", postcode: "4102" },
  { name: "Annerley", region: "Southside", postcode: "4103" },
  { name: "Fairfield", region: "Southside", postcode: "4103" },
  { name: "Yeronga", region: "Southside", postcode: "4104" },
  { name: "Yeerongpilly", region: "Southside", postcode: "4105" },
  { name: "Moorooka", region: "Southside", postcode: "4105" },
  { name: "Tarragindi", region: "Southside", postcode: "4121" },
  { name: "Holland Park", region: "Southside", postcode: "4121" },
  { name: "Mount Gravatt", region: "Southside", postcode: "4122" },
  { name: "Upper Mount Gravatt", region: "Southside", postcode: "4122" },
  { name: "Wishart", region: "Southside", postcode: "4122" },
  { name: "Carindale", region: "Southside", postcode: "4152" },
  { name: "Camp Hill", region: "Southside", postcode: "4152" },
  { name: "Coorparoo", region: "Southside", postcode: "4151" },
  { name: "Greenslopes", region: "Southside", postcode: "4120" },
  { name: "Stones Corner", region: "Southside", postcode: "4120" },
  { name: "East Brisbane", region: "Southside", postcode: "4169" },
  { name: "Norman Park", region: "Southside", postcode: "4170" },
  { name: "Morningside", region: "Southside", postcode: "4170" },
  { name: "Bulimba", region: "Southside", postcode: "4171" },
  { name: "Hawthorne", region: "Southside", postcode: "4171" },
  { name: "Balmoral", region: "Southside", postcode: "4171" },
  { name: "Cannon Hill", region: "Southside", postcode: "4170" },
  { name: "Murarrie", region: "Southside", postcode: "4172" },
  { name: "Sunnybank", region: "Southside", postcode: "4109" },
  { name: "Sunnybank Hills", region: "Southside", postcode: "4109" },
  { name: "Runcorn", region: "Southside", postcode: "4113" },
  { name: "Eight Mile Plains", region: "Southside", postcode: "4113" },
  { name: "Underwood", region: "Southside", postcode: "4119" },
  { name: "Springwood", region: "Southside", postcode: "4127" },
  { name: "Logan Central", region: "Southside", postcode: "4114" },
  { name: "Garden City", region: "Southside", postcode: "4122" },
  { name: "Macgregor", region: "Southside", postcode: "4109" },
  { name: "Robertson", region: "Southside", postcode: "4109" },
  { name: "Salisbury", region: "Southside", postcode: "4107" },
  { name: "Rocklea", region: "Southside", postcode: "4106" },
  { name: "Acacia Ridge", region: "Southside", postcode: "4110" },
  { name: "Algester", region: "Southside", postcode: "4115" },
  { name: "Calamvale", region: "Southside", postcode: "4116" },
  // East
  { name: "Wynnum", region: "East", postcode: "4178" },
  { name: "Manly", region: "East", postcode: "4179" },
  { name: "Lota", region: "East", postcode: "4179" },
  { name: "Tingalpa", region: "East", postcode: "4173" },
  { name: "Wakerley", region: "East", postcode: "4154" },
  { name: "Gumdale", region: "East", postcode: "4154" },
  { name: "Chandler", region: "East", postcode: "4155" },
  { name: "Belmont", region: "East", postcode: "4153" },
  { name: "Carina", region: "East", postcode: "4152" },
  { name: "Seven Hills", region: "East", postcode: "4170" },
  // West
  { name: "Toowong", region: "West", postcode: "4066" },
  { name: "Taringa", region: "West", postcode: "4068" },
  { name: "Indooroopilly", region: "West", postcode: "4068" },
  { name: "St Lucia", region: "West", postcode: "4067" },
  { name: "Chapel Hill", region: "West", postcode: "4069" },
  { name: "Kenmore", region: "West", postcode: "4069" },
  { name: "Fig Tree Pocket", region: "West", postcode: "4069" },
  { name: "Jindalee", region: "West", postcode: "4074" },
  { name: "Mount Ommaney", region: "West", postcode: "4074" },
  { name: "Middle Park", region: "West", postcode: "4074" },
  { name: "Riverhills", region: "West", postcode: "4074" },
  { name: "Sherwood", region: "West", postcode: "4075" },
  { name: "Corinda", region: "West", postcode: "4075" },
  { name: "Oxley", region: "West", postcode: "4075" },
  { name: "Graceville", region: "West", postcode: "4075" },
  { name: "Chelmer", region: "West", postcode: "4068" },
  { name: "Milton", region: "West", postcode: "4064" },
  { name: "Auchenflower", region: "West", postcode: "4066" },
];

export function isServiceSuburb(name: string): boolean {
  const needle = name.trim().toLowerCase();
  return SUBURBS.some((s) => s.name.toLowerCase() === needle);
}

export function searchSuburbs(query: string, limit = 12): Suburb[] {
  const q = query.trim().toLowerCase();
  if (!q) return SUBURBS.slice(0, limit);
  return SUBURBS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) ||
      s.postcode.includes(q) ||
      s.region.toLowerCase().includes(q),
  ).slice(0, limit);
}

export const REGIONS: Region[] = [
  "Inner Brisbane",
  "Northside",
  "Southside",
  "East",
  "West",
];
