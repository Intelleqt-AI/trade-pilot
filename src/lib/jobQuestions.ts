// Shared job-answer question labels + key formatter, used by the job feed drawer
// and the chat "Job details" popup. Keep this the single source for these labels.

export const QUESTION_LABELS: Record<string, string> = {
  // Plumbing – Boilers
  boilers_q1: 'What type of boiler do you have?',
  boilers_q2: 'What needs doing to the boiler?',
  boilers_q3: 'Is the property domestic or commercial?',

  // Plumbing – Radiators
  radiators_q1: 'What do you need help with?',
  radiators_q2: 'How many radiators are involved (approx)?',
  radiators_q3: 'Is this for a domestic or commercial property?',

  // Plumbing – Appliances
  appliances_q1: 'Which appliance do you need help with?',
  appliances_q2: 'What needs doing?',
  appliances_q3: 'Is the property domestic or commercial?',

  // Plumbing – Fixtures
  fixtures_q1: 'Which fixture needs attention?',
  fixtures_q2: 'What is the issue?',
  fixtures_q3: 'Is the property domestic or commercial?',

  // Plumbing – Pipework, taps & drainage
  'pipework,_taps_and_drainage_q1': 'What best describes the job?',
  'pipework,_taps_and_drainage_q2': 'Is this an urgent issue?',
  'pipework,_taps_and_drainage_q3': 'Is the property domestic or commercial?',

  // Gas Engineer – Boilers (gas)
  boilers_gas_q1: 'What fuel does your boiler use?',
  boilers_gas_q2: 'What needs doing?',
  boilers_gas_q3: 'Property type',

  // Gas Engineer – Gas hobs, cookers & ovens
  gas_hobs_cookers_and_ovens_q1: 'Which appliance?',
  gas_hobs_cookers_and_ovens_q2: 'What needs doing?',
  gas_hobs_cookers_and_ovens_q3: 'Property type',

  // Gas Engineer – Gas fires & flues
  gas_fires_and_flues_q1: 'What type of unit?',
  gas_fires_and_flues_q2: 'What needs doing?',
  gas_fires_and_flues_q3: 'Property type',

  // Gas Engineer – Gas safety certificates (CP12)
  gas_safety_certificates_cp12_q1: 'Which certificate?',
  gas_safety_certificates_cp12_q2: 'How many gas appliances to test?',
  gas_safety_certificates_cp12_q3: 'Property type',

  // Gas Engineer – Gas leaks & emergency
  gas_leaks_and_emergency_q1: 'What is the issue?',
  gas_leaks_and_emergency_q2: 'How urgent?',
  gas_leaks_and_emergency_q3: 'Property type',

  // Gas Engineer – Gas pipework
  gas_pipework_q1: 'What best describes the job?',
  gas_pipework_q2: 'Approximate length / scale?',
  gas_pipework_q3: 'Property type',

  // Roofing – Pitched roof repairs
  pitched_roof_repairs_q1: "What's the issue?",
  pitched_roof_repairs_q2: 'How big is the affected area?',
  pitched_roof_repairs_q3: 'Property type',

  // Roofing – Full or partial reroof
  full_or_partial_reroof_q1: "What's the scope?",
  full_or_partial_reroof_q2: 'Roof covering material?',
  full_or_partial_reroof_q3: 'Property type',

  // Roofing – Flat roof
  flat_roof_q1: 'What needs doing?',
  flat_roof_q2: 'Flat roof material?',
  flat_roof_q3: 'Property type',

  // Roofing – Gutters, fascias & soffits
  gutters_fascias_and_soffits_q1: "What's the job?",
  gutters_fascias_and_soffits_q2: 'Approximate scale?',
  gutters_fascias_and_soffits_q3: 'Property type',

  // Roofing – Chimney work
  chimney_work_q1: "What's needed?",
  chimney_work_q2: 'How will the chimney be accessed?',
  chimney_work_q3: 'Property type',

  // Roofing – Roof windows / skylights
  roof_windows___skylights_q1: 'What do you need?',
  roof_windows___skylights_q2: 'How many windows?',
  roof_windows___skylights_q3: 'Property type',

  // Roofing – Lead work & flashing
  lead_work_and_flashing_q1: "What's the job?",
  lead_work_and_flashing_q2: 'Where is the lead work?',
  lead_work_and_flashing_q3: 'Property type',

  // Roofing – Moss removal & roof cleaning
  moss_removal_and_roof_cleaning_q1: "What's the job?",
  moss_removal_and_roof_cleaning_q2: 'Scale of clean?',
  moss_removal_and_roof_cleaning_q3: 'Property type',

  // Electrical – Fuse board (Consumer unit)
  'fuse_board_(consumer_unit)_q1': 'What needs doing?',
  'fuse_board_(consumer_unit)_q2': 'How old is the existing unit?',
  'fuse_board_(consumer_unit)_q3': 'Property type',

  // Electrical – Lighting
  lighting_q1: 'What do you need help with?',
  lighting_q2: 'How many lights/fittings are involved?',
  lighting_q3: 'Property type',

  // Electrical – Sockets & switches
  sockets_and_switches_q1: 'What do you need help with?',
  sockets_and_switches_q2: 'How many sockets/switches?',
  sockets_and_switches_q3: 'Property type',

  // Electrical – Rewiring & cabling
  rewiring_and_cabling_q1: 'What best describes the job?',
  rewiring_and_cabling_q2: 'Is the power currently working?',
  rewiring_and_cabling_q3: 'Property type',

  // Electrical – EV chargers
  ev_chargers_q1: 'What do you need?',
  ev_chargers_q2: 'Where is it being installed?',
  ev_chargers_q3: 'Property type',

  // Electrical – Testing & certificates
  testing_and_certificates_q1: 'Which certificate/test?',
  testing_and_certificates_q2: 'Approximate property size?',
  testing_and_certificates_q3: 'Property type',

  // Electrical – Appliances & hardwired equipment
  appliances_and_hardwired_equipment_q1: 'Which appliance?',
  appliances_and_hardwired_equipment_q2: 'What needs doing?',
  appliances_and_hardwired_equipment_q3: 'Property type',

  // Electrical – Smart home & networking
  smart_home_and_networking_q1: 'What do you need help with?',
  smart_home_and_networking_q2: 'How many devices/points?',
  smart_home_and_networking_q3: 'Property type',
};

export function formatAnswerKey(key: string): string {
  return key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

/** Human label for an answer key, preferring the curated map. */
export function answerLabel(key: string): string {
  return QUESTION_LABELS[key] ?? formatAnswerKey(key);
}
