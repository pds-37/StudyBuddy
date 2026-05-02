export type SkillTaxonomyItem = {
  id: string;
  name: string;
  aliases: string[];
  category: string;
  source: "onet" | "esco" | "custom";
};

export type SkillGap = {
  skill: string;
  requiredScore: number;
  userScore: number;
  gapScore: number;
};
