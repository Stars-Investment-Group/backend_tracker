/**
 * Series BCEAO synchronisees — vague 1 : noyau macroeconomique des maquettes.
 *
 * Codes verifies un a un contre l'inventaire reel de DBnomics (septembre 2026).
 * Prefixes pays EDEN : BBB=Benin CCC=Burkina AAA=Cote d'Ivoire SSS=Guinee-Bissau
 *                      DDD=Mali HHH=Niger KKK=Senegal TTT=Togo ZZZ=Ensemble UMOA
 *
 * Toutes ces series sont ANNUELLES et couvrent 1960-2024. DBnomics ne publie pas
 * de frequence infra-annuelle pour la BCEAO, et s'arrete a 2024 : le comblement
 * 2025-2026 passera par un acces direct a la base EDEN.
 */
export interface SeriesConfig {
  provider: string;
  dataset: string;
  seriesCode: string;
  country: string | null;
}

export const SERIES_TO_SYNC: SeriesConfig[] = [
  // #1 — PIB nominal
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'CCCSR1015A0BP', country: 'BF' },  // Burkina Faso
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'BBBSR1015A0BP', country: 'BJ' },  // Bénin
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'AAASR1015A0BP', country: 'CI' },  // Côte d'Ivoire
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'ZZZSR1015A0BP', country: null },  // Ensemble UMOA
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'SSSSR1015A0BP', country: 'GW' },  // Guinée-Bissau
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'DDDSR1015A0BP', country: 'ML' },  // Mali
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'HHHSR1015A0BP', country: 'NE' },  // Niger
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'KKKSR1015A0BP', country: 'SN' },  // Sénégal
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'TTTSR1015A0BP', country: 'TG' },  // Togo

  // #3 — Croissance du PIB réel
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'CCCSR1041A0BP', country: 'BF' },  // Burkina Faso
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'BBBSR1041A0BP', country: 'BJ' },  // Bénin
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'AAASR1041A0BP', country: 'CI' },  // Côte d'Ivoire
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'ZZZSR1041A0BP', country: null },  // Ensemble UMOA
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'SSSSR1041A0BP', country: 'GW' },  // Guinée-Bissau
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'DDDSR1041A0BP', country: 'ML' },  // Mali
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'HHHSR1041A0BP', country: 'NE' },  // Niger
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'KKKSR1041A0BP', country: 'SN' },  // Sénégal
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'TTTSR1041A0BP', country: 'TG' },  // Togo

  // #4 — Inflation (moyenne annuelle)
  { provider: 'BCEAO', dataset: 'TAUXINFL_A', seriesCode: 'CCCSR3072A0BP', country: 'BF' },  // Burkina Faso
  { provider: 'BCEAO', dataset: 'TAUXINFL_A', seriesCode: 'BBBSR3072A0BP', country: 'BJ' },  // Bénin
  { provider: 'BCEAO', dataset: 'TAUXINFL_A', seriesCode: 'AAASR3072A0BP', country: 'CI' },  // Côte d'Ivoire
  { provider: 'BCEAO', dataset: 'TAUXINFL_A', seriesCode: 'ZZZSR3072A0BP', country: null },  // Ensemble UMOA
  { provider: 'BCEAO', dataset: 'TAUXINFL_A', seriesCode: 'SSSSR3072A0BP', country: 'GW' },  // Guinée-Bissau
  { provider: 'BCEAO', dataset: 'TAUXINFL_A', seriesCode: 'DDDSR3072A0BP', country: 'ML' },  // Mali
  { provider: 'BCEAO', dataset: 'TAUXINFL_A', seriesCode: 'HHHSR3072A0BP', country: 'NE' },  // Niger
  { provider: 'BCEAO', dataset: 'TAUXINFL_A', seriesCode: 'KKKSR3072A0BP', country: 'SN' },  // Sénégal
  { provider: 'BCEAO', dataset: 'TAUXINFL_A', seriesCode: 'TTTSR3072A0BP', country: 'TG' },  // Togo

  // #6 — IPC global
  { provider: 'BCEAO', dataset: 'IHPC', seriesCode: 'CCCSR3017A0BP', country: 'BF' },  // Burkina Faso
  { provider: 'BCEAO', dataset: 'IHPC', seriesCode: 'BBBSR3017A0BP', country: 'BJ' },  // Bénin
  { provider: 'BCEAO', dataset: 'IHPC', seriesCode: 'AAASR3017A0BP', country: 'CI' },  // Côte d'Ivoire
  { provider: 'BCEAO', dataset: 'IHPC', seriesCode: 'ZZZSR3017A0BP', country: null },  // Ensemble UMOA
  { provider: 'BCEAO', dataset: 'IHPC', seriesCode: 'SSSSR3017A0BP', country: 'GW' },  // Guinée-Bissau
  { provider: 'BCEAO', dataset: 'IHPC', seriesCode: 'DDDSR3017A0BP', country: 'ML' },  // Mali
  { provider: 'BCEAO', dataset: 'IHPC', seriesCode: 'HHHSR3017A0BP', country: 'NE' },  // Niger
  { provider: 'BCEAO', dataset: 'IHPC', seriesCode: 'KKKSR3017A0BP', country: 'SN' },  // Sénégal
  { provider: 'BCEAO', dataset: 'IHPC', seriesCode: 'TTTSR3017A0BP', country: 'TG' },  // Togo

  // #11 — Exportations de biens et services
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'CCCSR1023A0BP', country: 'BF' },  // Burkina Faso
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'BBBSR1023A0BP', country: 'BJ' },  // Bénin
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'AAASR1023A0BP', country: 'CI' },  // Côte d'Ivoire
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'ZZZSR1023A0BP', country: null },  // Ensemble UMOA
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'SSSSR1023A0BP', country: 'GW' },  // Guinée-Bissau
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'DDDSR1023A0BP', country: 'ML' },  // Mali
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'HHHSR1023A0BP', country: 'NE' },  // Niger
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'KKKSR1023A0BP', country: 'SN' },  // Sénégal
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'TTTSR1023A0BP', country: 'TG' },  // Togo

  // #12 — Importations de biens et services
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'CCCSR1024A0BP', country: 'BF' },  // Burkina Faso
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'BBBSR1024A0BP', country: 'BJ' },  // Bénin
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'AAASR1024A0BP', country: 'CI' },  // Côte d'Ivoire
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'ZZZSR1024A0BP', country: null },  // Ensemble UMOA
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'SSSSR1024A0BP', country: 'GW' },  // Guinée-Bissau
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'DDDSR1024A0BP', country: 'ML' },  // Mali
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'HHHSR1024A0BP', country: 'NE' },  // Niger
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'KKKSR1024A0BP', country: 'SN' },  // Sénégal
  { provider: 'BCEAO', dataset: 'PIBN', seriesCode: 'TTTSR1024A0BP', country: 'TG' },  // Togo

  // #14 — Solde des transactions courantes
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'CCCSE1400A0AP', country: 'BF' },  // Burkina Faso
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'BBBSE1400A0AP', country: 'BJ' },  // Bénin
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'AAASE1400A0AP', country: 'CI' },  // Côte d'Ivoire
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'ZZZSE1400A0AP', country: null },  // Ensemble UMOA
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'SSSSE1400A0AP', country: 'GW' },  // Guinée-Bissau
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'DDDSE1400A0AP', country: 'ML' },  // Mali
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'HHHSE1400A0AP', country: 'NE' },  // Niger
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'KKKSE1400A0AP', country: 'SN' },  // Sénégal
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'TTTSE1400A0AP', country: 'TG' },  // Togo

  // #15 — Balance courante / PIB
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'CCCSE1488A0AP', country: 'BF' },  // Burkina Faso
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'BBBSE1488A0AP', country: 'BJ' },  // Bénin
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'AAASE1488A0AP', country: 'CI' },  // Côte d'Ivoire
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'ZZZSE1488A0AP', country: null },  // Ensemble UMOA
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'SSSSE1488A0AP', country: 'GW' },  // Guinée-Bissau
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'DDDSE1488A0AP', country: 'ML' },  // Mali
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'HHHSE1488A0AP', country: 'NE' },  // Niger
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'KKKSE1488A0AP', country: 'SN' },  // Sénégal
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'TTTSE1488A0AP', country: 'TG' },  // Togo

  // #20 — Masse monétaire M2
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'CCCSF1412A0AP', country: 'BF' },  // Burkina Faso
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'BBBSF1412A0AP', country: 'BJ' },  // Bénin
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'AAASF1412A0AP', country: 'CI' },  // Côte d'Ivoire
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'ZZZSF1412A0AP', country: null },  // Ensemble UMOA
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'SSSSF1412A0AP', country: 'GW' },  // Guinée-Bissau
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'DDDSF1412A0AP', country: 'ML' },  // Mali
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'HHHSF1412A0AP', country: 'NE' },  // Niger
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'KKKSF1412A0AP', country: 'SN' },  // Sénégal
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'TTTSF1412A0AP', country: 'TG' },  // Togo

  // #24 — Actifs extérieurs nets
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'CCCSF1413A0AP', country: 'BF' },  // Burkina Faso
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'BBBSF1413A0AP', country: 'BJ' },  // Bénin
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'AAASF1413A0AP', country: 'CI' },  // Côte d'Ivoire
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'ZZZSF1413A0AP', country: null },  // Ensemble UMOA
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'SSSSF1413A0AP', country: 'GW' },  // Guinée-Bissau
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'DDDSF1413A0AP', country: 'ML' },  // Mali
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'HHHSF1413A0AP', country: 'NE' },  // Niger
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'KKKSF1413A0AP', country: 'SN' },  // Sénégal
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'TTTSF1413A0AP', country: 'TG' },  // Togo

  // #29 — Crédits à l'économie
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'CCCSF1420A0AP', country: 'BF' },  // Burkina Faso
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'BBBSF1420A0AP', country: 'BJ' },  // Bénin
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'AAASF1420A0AP', country: 'CI' },  // Côte d'Ivoire
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'ZZZSF1420A0AP', country: null },  // Ensemble UMOA
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'SSSSF1420A0AP', country: 'GW' },  // Guinée-Bissau
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'DDDSF1420A0AP', country: 'ML' },  // Mali
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'HHHSF1420A0AP', country: 'NE' },  // Niger
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'KKKSF1420A0AP', country: 'SN' },  // Sénégal
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'TTTSF1420A0AP', country: 'TG' },  // Togo

  // #41 — Solde budgétaire global
  { provider: 'BCEAO', dataset: 'TOFE', seriesCode: 'CCCFP1043A0AP', country: 'BF' },  // Burkina Faso
  { provider: 'BCEAO', dataset: 'TOFE', seriesCode: 'BBBFP1043A0AP', country: 'BJ' },  // Bénin
  { provider: 'BCEAO', dataset: 'TOFE', seriesCode: 'AAAFP1043A0AP', country: 'CI' },  // Côte d'Ivoire
  { provider: 'BCEAO', dataset: 'TOFE', seriesCode: 'ZZZFP1043A0AP', country: null },  // Ensemble UMOA
  { provider: 'BCEAO', dataset: 'TOFE', seriesCode: 'SSSFP1043A0AP', country: 'GW' },  // Guinée-Bissau
  { provider: 'BCEAO', dataset: 'TOFE', seriesCode: 'DDDFP1043A0AP', country: 'ML' },  // Mali
  { provider: 'BCEAO', dataset: 'TOFE', seriesCode: 'HHHFP1043A0AP', country: 'NE' },  // Niger
  { provider: 'BCEAO', dataset: 'TOFE', seriesCode: 'KKKFP1043A0AP', country: 'SN' },  // Sénégal
  { provider: 'BCEAO', dataset: 'TOFE', seriesCode: 'TTTFP1043A0AP', country: 'TG' },  // Togo

  // #43 — Stock de la dette publique
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'CCCFP3001A0FA', country: 'BF' },  // Burkina Faso
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'BBBFP3001A0FA', country: 'BJ' },  // Bénin
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'AAAFP3001A0FA', country: 'CI' },  // Côte d'Ivoire
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'ZZZFP3001A0FA', country: null },  // Ensemble UMOA
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'SSSFP3001A0FA', country: 'GW' },  // Guinée-Bissau
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'DDDFP3001A0FA', country: 'ML' },  // Mali
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'HHHFP3001A0FA', country: 'NE' },  // Niger
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'KKKFP3001A0FA', country: 'SN' },  // Sénégal
  { provider: 'BCEAO', dataset: 'IMECO', seriesCode: 'TTTFP3001A0FA', country: 'TG' },  // Togo

  // #71 — Cours du dollar US
  { provider: 'BCEAO', dataset: 'TC_A', seriesCode: 'ZZZSF3100A0GP', country: null },  // Ensemble UMOA

  // #72 — Cours de la livre sterling (le doc de mapping l'etiquetait a tort 'euro' ;
  //        la parite FCFA/EUR est fixe a 655,957 et n'est pas publiee comme serie)
  { provider: 'BCEAO', dataset: 'TC_A', seriesCode: 'ZZZSF3109A0GP', country: null },  // Ensemble UMOA
];
