export type CrimeCategory = "SC" | "ST";

export interface CrimeYearRow {
  category: CrimeCategory;
  year: number;
  total_cases: number;
  population: number | null;
  population_is_projected: boolean | null;
  rate_per_lakh_population: number | null;
  schema_era: "pre_2017_definitions" | "post_2017_definitions";
}

export interface DoptGroupStats {
  total: number;
  sc: number;
  sc_pct: number;
  st: number;
  st_pct: number;
  obc: number;
  obc_pct: number;
  /** Derived residual (total - sc - st - obc), not directly reported by DoPT. Includes EWS, which DoPT doesn't break out separately. */
  general: number;
  general_pct: number;
}

export interface PopulationShare {
  sc_pct: number;
  st_pct: number;
  /** The calendar year this share was projected for -- not necessarily the same as the dataset's own year label (e.g. AISHE's fiscal-year strings). */
  year: number;
  note: string;
}

export interface PopulationShareTrendData {
  note: string;
  source: {
    anchors: string;
    denominator: string;
    methodology: string;
  };
  obc_general_note: string;
  years: { year: number; sc_pct: number; st_pct: number; is_projected: boolean }[];
}

export interface PopulationDistributionEstimateData {
  note: string;
  sc_st_source: string;
  scenarios: {
    id: string;
    label: string;
    obc_source: string;
    sc_pct: number;
    st_pct: number;
    obc_pct: number;
    general_pct: number;
  }[];
}

export interface DoptYearRow {
  year: number;
  data_as_on: string;
  ministries_reporting: number;
  coverage_gap: boolean;
  groups: {
    A: DoptGroupStats;
    B: DoptGroupStats;
    C_excl_safai_karamchari: DoptGroupStats;
    C_safai_karamchari: DoptGroupStats;
    Total: DoptGroupStats;
  };
  statutory_quotas: {
    sc_pct: number;
    st_pct: number;
    obc_pct: number;
  };
  population_share: PopulationShare;
}

export interface AisheGerYear {
  year: string;
  all: number;
  sc: number;
  st: number;
  source: string;
}

export interface ConvictionDisposalYear {
  year: number;
  cases_registered: number;
  cases_chargesheeted: number;
  cases_convicted: number;
  conviction_rate_pct: number;
  cases_pending_trial_year_end: number;
  chargesheet_rate_pct: number;
}

export interface ConvictionDisposalData {
  source: {
    title: string;
    answered_on: string;
    url: string;
    table_location: string;
  };
  sc: ConvictionDisposalYear[];
  st: ConvictionDisposalYear[];
}

export interface LokSabhaEra {
  era_label: string;
  applicable_elections: string;
  total_seats: number;
  sc_reserved_seats: number;
  st_reserved_seats: number;
  source: string;
  sc_pct_of_seats: number;
  st_pct_of_seats: number;
}

export interface LokSabhaData {
  scope_notes: {
    rajya_sabha: string;
    obc: string;
    state_assemblies: string;
    actual_elected_beyond_reserved_seats: string;
  };
  delimitation_eras: LokSabhaEra[];
}

export interface AssetGroupValues {
  ST: { pct_households_owning_assets: number; ava_rs: number };
  SC: { pct_households_owning_assets: number; ava_rs: number };
  OBC: { pct_households_owning_assets: number; ava_rs: number };
  Others: { pct_households_owning_assets: number; ava_rs: number };
  all: { pct_households_owning_assets: number; ava_rs: number };
}

export interface DebtGroupValues {
  ST: { ioi_pct: number; aod_rs: number };
  SC: { ioi_pct: number; aod_rs: number };
  OBC: { ioi_pct: number; aod_rs: number };
  Others: { ioi_pct: number; aod_rs: number };
  all: { ioi_pct: number; aod_rs: number };
}

export interface AidisData {
  scope_note: string;
  sources: Record<string, { report: string; publisher: string; url: string; reference_date: string; tables_used: Record<string, string> }>;
  assets_2019_rs: { note: string; rural: AssetGroupValues; urban: AssetGroupValues };
  debt_by_year: {
    note: string;
    "2012_13": { rural: DebtGroupValues; urban: DebtGroupValues };
    "2019": { rural: DebtGroupValues; urban: DebtGroupValues };
  };
  debt_asset_ratio_2019_pct: {
    note: string;
    rural: { ST: number; SC: number; OBC: number; Others: number; all: number };
    urban: { ST: number; SC: number; OBC: number; Others: number; all: number };
  };
}

export interface AcademicWealthConcentrationData {
  wealth_concentration_gap: {
    note: string;
    source: { study: string; url: string; table_reference: string; methodology: string };
    years: number[];
    series: {
      FC: (number | null)[];
      OBC: (number | null)[];
      SC: (number | null)[];
      ST: (number | null)[];
    };
    source_quote: string;
  };
  corroborating_study_not_charted: {
    study: string;
    url: string;
    why_not_charted: string;
    source_quote: string;
  };
}

export interface MpceGroupValues {
  ST: number;
  SC: number;
  OBC: number;
  Others: number;
  all?: number;
}

export interface MpceData {
  critical_caveat: string;
  sources: Record<string, { report: string; publisher: string; url: string; tables_used: Record<string, string> }>;
  absolute_mpce_rs: {
    note: string;
    "2011_12": { rural: MpceGroupValues; urban: MpceGroupValues };
    "2022_23": { rural: MpceGroupValues; urban: MpceGroupValues };
  };
  pct_gap_from_average: {
    note: string;
    rural: Record<string, MpceGroupValues>;
    urban: Record<string, MpceGroupValues>;
  };
}

export interface AisheData {
  ger_trend: {
    note: string;
    years: AisheGerYear[];
  };
  enrollment_share_latest: {
    year: string;
    total_enrollment_crore: number;
    sc_pct_of_total: number;
    st_pct_of_total: number;
    obc_pct_of_total: number;
    sc_count_lakh: number;
    st_count_lakh: number;
    obc_count_crore: number;
    note: string;
    /** Derived residual against total_enrollment_crore -- AISHE doesn't state a General/Other share directly. */
    general_pct_of_total: number;
    general_count_lakh: number;
    population_share: PopulationShare;
  };
  enrollment_prior_year: {
    year: string;
    sc_count_lakh: number;
    st_count_lakh: number;
    obc_count_crore: number;
  };
}

export interface UntouchabilityData {
  methodology_note: string;
  source: {
    paper: string;
    underlying_survey: string;
    url: string;
    single_round_caveat: string;
  };
  table1_practice_by_social_group: {
    question: string;
    note: string;
    brahmins_pct: number;
    forward_castes_pct: number;
    obc_pct: number;
    sc_pct: number;
    st_pct: number;
    table_total_pct: number;
    prose_headline_total_pct: number;
  };
  table2_specific_practice: {
    question: string;
    note: string;
    brahmins_pct: number;
    forward_castes_pct: number;
    obc_pct: number;
    sc_pct: number;
    st_pct: number;
    others_pct: number;
    total_pct: number;
  };
  rural_urban: { rural_pct: number; urban_pct: number };
  income_quintile: { poorest_pct: number; richest_pct: number; note: string };
  regional: {
    note: string;
    central_plains_pct: number;
    north_pct: number;
    hills_pct: number;
    south_east_west_note: string;
  };
}
