import {
  FullMockExamDataset,
  MockSectionData,
  MockQuestion,
  OFFICIAL_CAMBRIDGE_MOCK_DATA,
} from './fullMockExamData';
import {
  CAMBRIDGE_BOOKS_CATALOG,
  CambridgeBook,
  CambridgeTestSummary,
  getStoredCustomTests,
} from './cambridgeBooksCatalog';

/**
 * Generate rich, authentic reading paragraphs for a Cambridge passage
 */
function generatePassageContent(topic: string, bookNumber: number, passageNumber: number) {
  const cleanTitle = topic.replace(/^Passage \d+:\s*/i, '');

  if (cleanTitle.toLowerCase().includes('sponge') || cleanTitle.toLowerCase().includes('marine')) {
    return [
      {
        id: `p${passageNumber}-a`,
        label: 'Paragraph A',
        text: `In the shallow turquoise lagoons surrounding Zanzibar’s archipelago, coastal communities have historically relied on wild seaweed harvesting and artisanal fishing. However, rising sea-surface temperatures and overfishing have devastated traditional yields. In response, marine biologists and local cooperatives pioneered the cultivation of natural bath sponges (Porifera). Unlike fin-fish aquaculture, sponge farming demands no synthetic feeds or antibiotics, relying exclusively on ambient phytoplankton filtered from tidal currents.`,
      },
      {
        id: `p${passageNumber}-b`,
        label: 'Paragraph B',
        text: `The mechanical propagation process is remarkably resilient. Cultivators harvest mature wild colonies and divide them into small cuttings measuring approximately five cubic centimeters. These fragments are secured to underwater nylon lines anchored to coral substrates. Within twelve to eighteen months, each cutting regenerates into a spherical commercial sponge, absorbing trace heavy metals and maintaining high microbial diversity throughout the coastal benthic zone.`,
      },
      {
        id: `p${passageNumber}-c`,
        label: 'Paragraph C',
        text: `Commercial processing of bath sponges remains low-tech and environmentally benign. Once harvested, sponges are submerged in terrestrial shaded troughs where biological decay of organic tissue occurs under natural enzymatic processes. Periodic rinsing with freshwater cleanses the flexible spongin fibrous skeleton without degrading tensile integrity, producing a premium cosmetic product with high global demand.`,
      },
      {
        id: `p${passageNumber}-d`,
        label: 'Paragraph D',
        text: `Socio-economic studies conducted by the Institute of Marine Sciences indicate that sponge farms generate three times the revenue per square meter compared to red seaweed monocultures. Crucially, the farming methodology allows female entrepreneurs, who historically lacked access to offshore motorized boats, to manage protected intertidal plots safely during low-tide windows.`,
      },
      {
        id: `p${passageNumber}-e`,
        label: 'Paragraph E',
        text: `Despite these operational successes, ecological hurdles persist. Epiphytic algal blooms can colonize juvenile cuttings during equatorial dry spells, suffocating the porous filtration cavities. Researchers are currently exploring co-culture arrangements with herbivorous sea urchins and herbivorous gastropods to biologically graze competing macroalgae.`,
      },
      {
        id: `p${passageNumber}-f`,
        label: 'Paragraph F',
        text: `Ultimately, Zanzibar’s sponge aquaculture represents a compelling case study in regenerative blue economy design. By pairing traditional ecological knowledge with targeted biological monitoring, coastal societies can establish resilient livelihoods that fortify rather than erode sensitive marine ecosystems.`,
      },
    ];
  }

  if (cleanTitle.toLowerCase().includes('urban') || cleanTitle.toLowerCase().includes('transport') || cleanTitle.toLowerCase().includes('mobility')) {
    return [
      {
        id: `p${passageNumber}-a`,
        label: 'Paragraph A',
        text: `The modern urban landscape is undergoing its most rapid structural transformation since the advent of the internal combustion engine. High-density metropolises worldwide are grappling with the unsustainable externalities of private automobile dominance: chronic gridlock, acoustic noise pollution, particulate emissions, and vast tracts of public land monopolized by parking infrastructure. In response, municipal planners are turning toward micro-mobility ecosystems.`,
      },
      {
        id: `p${passageNumber}-b`,
        label: 'Paragraph B',
        text: `Micro-mobility encompasses lightweight, human- or battery-powered vehicles operating at speeds under 25 kilometers per hour, including dockless electric bicycles, cargo trikes, and standing scooters. When integrated with fixed-rail mass transit corridors, these solutions solve the perennial 'first-and-last-mile' conundrum that previously rendered non-car commuting uncompetitive for suburban residents.`,
      },
      {
        id: `p${passageNumber}-c`,
        label: 'Paragraph C',
        text: `Empirical telemetry collected across thirty European pilot municipalities demonstrates that dedicated segregated cycle tracks are the single greatest predictor of rider safety and equitable demographic adoption. When micro-mobility riders are compelled to share mixed-traffic lanes with heavy freight trucks, collision frequencies escalate fourfold, disproportionately deterring female and elderly commuters.`,
      },
      {
        id: `p${passageNumber}-d`,
        label: 'Paragraph D',
        text: `Economic assessments further challenge long-held merchant assumptions regarding car parking. Retail turnover in pedestrianized and bicycle-prioritized high streets in Paris, London, and Bogota showed an average 18% increase compared to automotive thoroughfares, as cyclists and pedestrians make more frequent, localized purchases than drivers passing through at speed.`,
      },
      {
        id: `p${passageNumber}-e`,
        label: 'Paragraph E',
        text: `Nevertheless, battery lifespan and electronic waste management present significant environmental bottlenecks. Early dockless scooter fleets suffered catastrophic lifecycle degradation, averaging fewer than 90 operational days before hardware failure. Contemporary second-generation designs feature swappable lithium-iron-phosphate (LFP) cells and modular aluminum chassis engineered for over five years of continuous municipal service.`,
      },
      {
        id: `p${passageNumber}-f`,
        label: 'Paragraph F',
        text: `The future of metropolitan transit relies not on silver-bullet technological innovations, but on systemic spatial reallocation. By converting curbside asphalt from vehicular storage into green pedestrian buffers and rapid charging hubs, cities can restore human scale and climate resilience to their urban fabric.`,
      },
    ];
  }

  // Default scholarly paragraphs tailored to the topic
  return [
    {
      id: `p${passageNumber}-a`,
      label: 'Paragraph A',
      text: `Historical and scientific inquiries into ${cleanTitle} have long captured academic attention across multiple disciplines. Early empirical investigations in the late twentieth century established foundational baselines, though researchers often lacked the computational modeling and non-invasive spectroscopic tools common in contemporary labs. Consequently, initial hypotheses posited linear development models that subsequent field data have substantially revised.`,
    },
    {
      id: `p${passageNumber}-b`,
      label: 'Paragraph B',
      text: `A major breakthrough occurred when interdisciplinary teams began synthesizing ecological records with socioeconomic archives. By cross-referencing micro-sedimentary core samples with regional trade registries, archaeologists and environmental scientists discovered subtle cyclical patterns previously dismissed as statistical anomalies. This evidence revealed that local societies demonstrated extraordinary resilience when confronting resource scarcity.`,
    },
    {
      id: `p${passageNumber}-c`,
      label: 'Paragraph C',
      text: `Technological innovations catalyzed further insights into structural mechanics and behavioral dynamics. Quantitative surveys demonstrated that traditional systems achieved high structural equilibrium while consuming a fraction of the raw embodied energy required by modern equivalents. These findings have stimulated considerable interest among industrial designers seeking biomimetic and low-carbon adaptations.`,
    },
    {
      id: `p${passageNumber}-d`,
      label: 'Paragraph D',
      text: `However, divergent schools of thought continue to dispute the universal applicability of these findings. Critics argue that localized microclimate conditions and distinct cultural imperatives limit direct extrapolation to contrasting geographic biomes. Comparative longitudinal studies across four distinct continental test sites are presently underway to adjudicate these competing theoretical paradigms.`,
    },
    {
      id: `p${passageNumber}-e`,
      label: 'Paragraph E',
      text: `Economic feasibility assessments underscore that institutional barriers often pose greater impediments than engineering hurdles. Subsidies favoring legacy industrial processes routinely distort procurement valuations, creating artificial market friction for regenerative methodologies despite proven life-cycle cost efficiencies.`,
    },
    {
      id: `p${passageNumber}-f`,
      label: 'Paragraph F',
      text: `In synthesis, contemporary research into ${cleanTitle} underscores the imperative of integrating heritage techniques with advanced empirical oversight. Far from being obsolete relics of earlier historical epochs, these paradigms provide indispensable design principles for navigating twenty-first-century sustainability and resource allocation challenges.`,
    },
  ];
}

/**
 * Generate 40 questions for the 3 reading passages of a Cambridge test
 */
function generateCambridgeReadingSection(test: CambridgeTestSummary, bookNumber: number): MockSectionData {
  const passages = test.readingPassages;

  // Passage 1: Questions 1 - 14 (TFNG & Fill In Notes)
  const p1Title = passages[0] || 'Passage 1: Sustainable Agricultural Innovations';
  const p1Clean = p1Title.replace(/^Passage \d+:\s*/i, '');
  const p1Questions: MockQuestion[] = [
    {
      id: `${test.id}-r1`,
      number: 1,
      part: 1,
      type: 'true_false_not_given',
      instruction: 'Do the following statements agree with the information given in Reading Passage 1?\nIn boxes 1–7 on your answer sheet, write:\nTRUE if the statement agrees with the information\nFALSE if the statement contradicts the information\nNOT GIVEN if there is no information on this',
      prompt: `Initial commercial cultivation of ${p1Clean.slice(0, 30)} required substantial investments in synthetic chemicals.`,
      correctAnswer: 'FALSE',
      explanation: 'Paragraph A confirms cultivation demands no synthetic feeds or antibiotics, relying on natural ambient filtering.',
    },
    {
      id: `${test.id}-r2`,
      number: 2,
      part: 1,
      type: 'true_false_not_given',
      instruction: 'Write TRUE, FALSE, or NOT GIVEN',
      prompt: 'Mature colonies are divided into small pieces before being secured to underwater lines.',
      correctAnswer: 'TRUE',
      explanation: 'Paragraph B explicitly describes dividing colonies into fragments measuring roughly five cubic centimeters.',
    },
    {
      id: `${test.id}-r3`,
      number: 3,
      part: 1,
      type: 'true_false_not_given',
      instruction: 'Write TRUE, FALSE, or NOT GIVEN',
      prompt: 'Artificial heating systems are used during the commercial drying stage.',
      correctAnswer: 'FALSE',
      explanation: 'Paragraph C states processing occurs under shaded troughs using natural enzymatic processes without artificial heating.',
    },
    {
      id: `${test.id}-r4`,
      number: 4,
      part: 1,
      type: 'true_false_not_given',
      instruction: 'Write TRUE, FALSE, or NOT GIVEN',
      prompt: 'Female entrepreneurs generate higher profit margins per unit than male farmers in the region.',
      correctAnswer: 'NOT GIVEN',
      explanation: 'Paragraph D notes female entrepreneurs gained independent income, but does not compare their profit margins with male farmers.',
    },
    {
      id: `${test.id}-r5`,
      number: 5,
      part: 1,
      type: 'true_false_not_given',
      instruction: 'Write TRUE, FALSE, or NOT GIVEN',
      prompt: 'Herbivorous sea creatures are being tested to control unwanted algal growth.',
      correctAnswer: 'TRUE',
      explanation: 'Paragraph E details co-culture trials with sea urchins and gastropods to graze competing macroalgae.',
    },
    {
      id: `${test.id}-r6`,
      number: 6,
      part: 1,
      type: 'true_false_not_given',
      instruction: 'Write TRUE, FALSE, or NOT GIVEN',
      prompt: 'Government regulations prohibit expanding the cultivation plots into deeper marine reserves.',
      correctAnswer: 'NOT GIVEN',
      explanation: 'Government territorial zoning regulations for deeper reserves are not discussed in the text.',
    },
    {
      id: `${test.id}-r7`,
      number: 7,
      part: 1,
      type: 'true_false_not_given',
      instruction: 'Write TRUE, FALSE, or NOT GIVEN',
      prompt: 'The integration of traditional methods with modern biological monitoring is recommended.',
      correctAnswer: 'TRUE',
      explanation: 'Paragraph F concludes by recommending pairing traditional ecological knowledge with targeted biological monitoring.',
    },
    // Notes completion: 8 - 14
    {
      id: `${test.id}-r8`,
      number: 8,
      part: 1,
      type: 'fill_in_the_blank',
      instruction: 'Complete the notes below.\nChoose ONE WORD ONLY from the passage for each answer.\nWrite your answers in boxes 8–14 on your answer sheet.',
      prompt: 'Key Advantages:\n- Organisms feed directly on [ 8 ] transported by ocean currents.',
      correctAnswer: ['phytoplankton', 'Phytoplankton'],
      explanation: 'Paragraph A confirms they rely on ambient phytoplankton filtered from tidal currents.',
    },
    {
      id: `${test.id}-r9`,
      number: 9,
      part: 1,
      type: 'fill_in_the_blank',
      instruction: 'Choose ONE WORD ONLY from the passage',
      prompt: '- Cuttings are anchored to coral substrates using [ 9 ] lines.',
      correctAnswer: ['nylon', 'Nylon'],
      explanation: 'Paragraph B explicitly states fragments are secured to underwater nylon lines.',
    },
    {
      id: `${test.id}-r10`,
      number: 10,
      part: 1,
      type: 'fill_in_the_blank',
      instruction: 'Choose ONE WORD ONLY from the passage',
      prompt: '- Organic tissue breakdown relies on natural [ 10 ] activity.',
      correctAnswer: ['enzymatic', 'Enzymatic'],
      explanation: 'Paragraph C mentions decay occurs under natural enzymatic processes.',
    },
    {
      id: `${test.id}-r11`,
      number: 11,
      part: 1,
      type: 'fill_in_the_blank',
      instruction: 'Choose ONE WORD ONLY from the passage',
      prompt: '- Cleansing with freshwater preserves the flexible [ 11 ] skeleton.',
      correctAnswer: ['spongin', 'Spongin'],
      explanation: 'Paragraph C describes cleansing the flexible spongin fibrous skeleton.',
    },
    {
      id: `${test.id}-r12`,
      number: 12,
      part: 1,
      type: 'fill_in_the_blank',
      instruction: 'Choose ONE WORD ONLY from the passage',
      prompt: '- Intertidal plots can be accessed safely during periods of [ 12 ] tide.',
      correctAnswer: ['low', 'Low'],
      explanation: 'Paragraph D notes women manage intertidal plots safely during low-tide windows.',
    },
    {
      id: `${test.id}-r13`,
      number: 13,
      part: 1,
      type: 'fill_in_the_blank',
      instruction: 'Choose ONE WORD ONLY from the passage',
      prompt: '- Algal blooms threaten juvenile cuttings during the [ 13 ] season.',
      correctAnswer: ['dry', 'Dry'],
      explanation: 'Paragraph E states blooms can colonize cuttings during equatorial dry spells.',
    },
    {
      id: `${test.id}-r14`,
      number: 14,
      part: 1,
      type: 'fill_in_the_blank',
      instruction: 'Choose ONE WORD ONLY from the passage',
      prompt: '- Co-culture utilizes herbivorous [ 14 ] alongside sea urchins.',
      correctAnswer: ['gastropods', 'Gastropods'],
      explanation: 'Paragraph E cites herbivorous gastropods to graze competing macroalgae.',
    },
  ];

  // Passage 2: Questions 15 - 27 (Matching Headings & MCQ)
  const p2Title = passages[1] || 'Passage 2: Technological Adaptation & Society';
  const p2Clean = p2Title.replace(/^Passage \d+:\s*/i, '');
  const p2Questions: MockQuestion[] = [
    {
      id: `${test.id}-r15`,
      number: 15,
      part: 2,
      type: 'matching_headings',
      instruction: 'Reading Passage 2 has six paragraphs, A–F.\nChoose the correct heading for each paragraph from the list of headings below.\nList of Headings:\ni. Resolving the terminal transit barrier\nii. Overcoming battery wear and hardware lifespans\niii. Financial gains for local commercial districts\niv. Segregated infrastructure as a safety determinant\nv. Structural crises facing motorized cities\nvi. Spatial re-engineering for climate resilience',
      prompt: 'Paragraph A',
      options: ['v. Structural crises facing motorized cities', 'i. Resolving the terminal transit barrier', 'iv. Segregated infrastructure as a safety determinant'],
      correctAnswer: 'v. Structural crises facing motorized cities',
      explanation: 'Paragraph A outlines gridlock, noise, and vehicular dominance.',
    },
    {
      id: `${test.id}-r16`,
      number: 16,
      part: 2,
      type: 'matching_headings',
      instruction: 'Choose the correct heading for Paragraph B',
      prompt: 'Paragraph B',
      options: ['i. Resolving the terminal transit barrier', 'iv. Segregated infrastructure as a safety determinant', 'iii. Financial gains for local commercial districts'],
      correctAnswer: 'i. Resolving the terminal transit barrier',
      explanation: 'Paragraph B explains solving the first-and-last-mile connectivity conundrum.',
    },
    {
      id: `${test.id}-r17`,
      number: 17,
      part: 2,
      type: 'matching_headings',
      instruction: 'Choose the correct heading for Paragraph C',
      prompt: 'Paragraph C',
      options: ['iv. Segregated infrastructure as a safety determinant', 'ii. Overcoming battery wear and hardware lifespans', 'vi. Spatial re-engineering for climate resilience'],
      correctAnswer: 'iv. Segregated infrastructure as a safety determinant',
      explanation: 'Paragraph C demonstrates protected lanes cut collisions and boost demographic safety.',
    },
    {
      id: `${test.id}-r18`,
      number: 18,
      part: 2,
      type: 'matching_headings',
      instruction: 'Choose the correct heading for Paragraph D',
      prompt: 'Paragraph D',
      options: ['iii. Financial gains for local commercial districts', 'v. Structural crises facing motorized cities', 'vi. Spatial re-engineering for climate resilience'],
      correctAnswer: 'iii. Financial gains for local commercial districts',
      explanation: 'Paragraph D presents data showing an 18% increase in retail turnover.',
    },
    {
      id: `${test.id}-r19`,
      number: 19,
      part: 2,
      type: 'matching_headings',
      instruction: 'Choose the correct heading for Paragraph E',
      prompt: 'Paragraph E',
      options: ['ii. Overcoming battery wear and hardware lifespans', 'iv. Segregated infrastructure as a safety determinant', 'i. Resolving the terminal transit barrier'],
      correctAnswer: 'ii. Overcoming battery wear and hardware lifespans',
      explanation: 'Paragraph E addresses early scooter degradation and longer-lasting LFP battery tech.',
    },
    {
      id: `${test.id}-r20`,
      number: 20,
      part: 2,
      type: 'matching_headings',
      instruction: 'Choose the correct heading for Paragraph F',
      prompt: 'Paragraph F',
      options: ['vi. Spatial re-engineering for climate resilience', 'v. Structural crises facing motorized cities', 'iii. Financial gains for local commercial districts'],
      correctAnswer: 'vi. Spatial re-engineering for climate resilience',
      explanation: 'Paragraph F emphasizes systemic spatial reallocation from parking to pedestrian zones.',
    },
    // MCQ 21 - 27
    {
      id: `${test.id}-r21`,
      number: 21,
      part: 2,
      type: 'multiple_choice',
      instruction: 'Choose the correct letter, A, B, C, or D.',
      prompt: 'What primary advantage does micro-mobility provide when combined with mass transit?',
      options: [
        'A. It eliminates the need for municipal road repairs.',
        'B. It bridges the distance between transit stations and final destinations.',
        'C. It lowers the retail cost of electric vehicles.',
        'D. It replaces heavy rail systems across suburban zones.',
      ],
      correctAnswer: 'B',
      explanation: 'Paragraph B explicitly highlights resolving the first-and-last-mile connectivity problem.',
    },
    {
      id: `${test.id}-r22`,
      number: 22,
      part: 2,
      type: 'multiple_choice',
      instruction: 'Choose the correct letter, A, B, C, or D.',
      prompt: 'According to European telemetry, what happened when cyclists shared lanes with freight vehicles?',
      options: [
        'A. Average vehicle speeds dropped significantly.',
        'B. Commuter participation among older citizens remained constant.',
        'C. The rate of collisions rose by four hundred percent.',
        'D. Freight delivery times improved noticeably.',
      ],
      correctAnswer: 'C',
      explanation: 'Paragraph C states collision frequencies escalate fourfold in mixed traffic.',
    },
    {
      id: `${test.id}-r23`,
      number: 23,
      part: 2,
      type: 'multiple_choice',
      instruction: 'Choose the correct letter, A, B, C, or D.',
      prompt: 'Studies of pedestrianized commercial corridors revealed that:',
      options: [
        'A. Shop owners experienced an 18% growth in retail sales.',
        'B. Commercial rents decreased substantially.',
        'C. Drivers spent more time browsing retail items.',
        'D. Local councils lost parking ticket revenues.',
      ],
      correctAnswer: 'A',
      explanation: 'Paragraph D confirms retail turnover showed an average 18% increase.',
    },
    {
      id: `${test.id}-r24`,
      number: 24,
      part: 2,
      type: 'fill_in_the_blank',
      instruction: 'Complete the sentence below. Write NO MORE THAN TWO WORDS.',
      prompt: 'Early scooter fleets frequently broke down within fewer than [ 24 ] days.',
      correctAnswer: ['90', 'ninety'],
      explanation: 'Paragraph E states early fleets averaged fewer than 90 operational days.',
    },
    {
      id: `${test.id}-r25`,
      number: 25,
      part: 2,
      type: 'fill_in_the_blank',
      instruction: 'Write NO MORE THAN TWO WORDS from the passage.',
      prompt: 'Modern second-generation scooters utilize [ 25 ] cells for extended durability.',
      correctAnswer: ['lithium-iron-phosphate', 'LFP'],
      explanation: 'Paragraph E cites swappable lithium-iron-phosphate (LFP) cells.',
    },
    {
      id: `${test.id}-r26`,
      number: 26,
      part: 2,
      type: 'fill_in_the_blank',
      instruction: 'Write NO MORE THAN TWO WORDS from the passage.',
      prompt: 'Vehicles must travel at velocities below [ 26 ] kilometers per hour to qualify as micro-mobility.',
      correctAnswer: ['25', 'twenty-five'],
      explanation: 'Paragraph B explicitly specifies speeds under 25 kilometers per hour.',
    },
    {
      id: `${test.id}-r27`,
      number: 27,
      part: 2,
      type: 'multiple_choice',
      instruction: 'Choose the correct letter, A, B, C, or D.',
      prompt: 'The author concludes that urban transit reform primarily requires:',
      options: [
        'A. Groundbreaking engineering breakthroughs.',
        'B. The redistribution of physical street space.',
        'C. Strict bans on all non-commercial deliveries.',
        'D. Universal subsidies for autonomous private cars.',
      ],
      correctAnswer: 'B',
      explanation: 'Paragraph F states progress relies on systemic spatial reallocation rather than silver-bullet tech.',
    },
  ];

  // Passage 3: Questions 28 - 40 (Summary Completion & Advanced Inference)
  const p3Title = passages[2] || 'Passage 3: Cognitive & Theoretical Paradigms';
  const p3Clean = p3Title.replace(/^Passage \d+:\s*/i, '');
  const p3Questions: MockQuestion[] = [
    {
      id: `${test.id}-r28`,
      number: 28,
      part: 3,
      type: 'multiple_choice',
      instruction: 'Choose the correct letter, A, B, C, or D.',
      prompt: `What limitation did early researchers studying ${p3Clean.slice(0, 30)} confront?`,
      options: [
        'A. They were denied access to historical archive records.',
        'B. They lacked advanced computational modeling and non-invasive analytical tools.',
        'C. Government agencies confiscated their sediment samples.',
        'D. Their work was rejected by international academic peers.',
      ],
      correctAnswer: 'B',
      explanation: 'Paragraph A explains researchers lacked modern computational modeling and non-invasive spectroscopy.',
    },
    {
      id: `${test.id}-r29`,
      number: 29,
      part: 3,
      type: 'multiple_choice',
      instruction: 'Choose the correct letter, A, B, C, or D.',
      prompt: 'How did scientists discover previously overlooked cyclical trends?',
      options: [
        'A. By interviewing generational farming families.',
        'B. By synthesizing sediment core analyses with regional trade registries.',
        'C. By replicating ancient navigation routes on open seas.',
        'D. By simulating climate change in laboratory test chambers.',
      ],
      correctAnswer: 'B',
      explanation: 'Paragraph B explicitly describes cross-referencing micro-sedimentary cores with regional trade registries.',
    },
    {
      id: `${test.id}-r30`,
      number: 30,
      part: 3,
      type: 'multiple_choice',
      instruction: 'Choose the correct letter, A, B, C, or D.',
      prompt: 'Modern industrial designers find ancient technical systems appealing because they:',
      options: [
        'A. Cost less to patent internationally.',
        'B. Achieved equilibrium with low embodied energy expenditure.',
        'C. Can be mass-manufactured without human oversight.',
        'D. Are legally exempt from emissions taxes.',
      ],
      correctAnswer: 'B',
      explanation: 'Paragraph C states traditional systems consumed a fraction of the raw embodied energy.',
    },
    {
      id: `${test.id}-r31`,
      number: 31,
      part: 3,
      type: 'multiple_choice',
      instruction: 'Choose the correct letter, A, B, C, or D.',
      prompt: 'Critics of the universal applicability theory argue that:',
      options: [
        'A. Historical records were deliberately falsified by scribes.',
        'B. Local microclimates and cultural contexts prevent direct extrapolation.',
        'C. Modern materials are universally superior in durability.',
        'D. International funding should focus solely on medical sciences.',
      ],
      correctAnswer: 'B',
      explanation: 'Paragraph D notes microclimate conditions and cultural imperatives limit direct extrapolation.',
    },
    // Summary completion: 32 - 37
    {
      id: `${test.id}-r32`,
      number: 32,
      part: 3,
      type: 'fill_in_the_blank',
      instruction: 'Complete the summary below.\nChoose NO MORE THAN TWO WORDS from the passage for each answer.',
      prompt: 'Barriers to Modern Implementation:\nAlthough traditional systems offer impressive efficiency, economic adoption is frequently delayed by [ 32 ] barriers.',
      correctAnswer: ['institutional', 'Institutional'],
      explanation: 'Paragraph E states institutional barriers often pose greater impediments than engineering hurdles.',
    },
    {
      id: `${test.id}-r33`,
      number: 33,
      part: 3,
      type: 'fill_in_the_blank',
      instruction: 'Choose NO MORE THAN TWO WORDS from the passage.',
      prompt: 'Government subsidies currently support [ 33 ] industrial processes.',
      correctAnswer: ['legacy', 'Legacy'],
      explanation: 'Paragraph E references subsidies favoring legacy industrial processes.',
    },
    {
      id: `${test.id}-r34`,
      number: 34,
      part: 3,
      type: 'fill_in_the_blank',
      instruction: 'Choose NO MORE THAN TWO WORDS from the passage.',
      prompt: 'These financial incentives distort [ 34 ] valuations for emerging methods.',
      correctAnswer: ['procurement', 'Procurement'],
      explanation: 'Paragraph E explains subsidies distort procurement valuations.',
    },
    {
      id: `${test.id}-r35`,
      number: 35,
      part: 3,
      type: 'fill_in_the_blank',
      instruction: 'Choose NO MORE THAN TWO WORDS from the passage.',
      prompt: 'Longitudinal studies are underway across four [ 35 ] test sites.',
      correctAnswer: ['continental', 'Continental'],
      explanation: 'Paragraph D cites studies across four distinct continental test sites.',
    },
    {
      id: `${test.id}-r36`,
      number: 36,
      part: 3,
      type: 'fill_in_the_blank',
      instruction: 'Choose NO MORE THAN TWO WORDS from the passage.',
      prompt: 'Early historical models incorrectly assumed development followed a [ 36 ] progression.',
      correctAnswer: ['linear', 'Linear'],
      explanation: 'Paragraph A indicates early hypotheses posited linear development models.',
    },
    {
      id: `${test.id}-r37`,
      number: 37,
      part: 3,
      type: 'fill_in_the_blank',
      instruction: 'Choose NO MORE THAN TWO WORDS from the passage.',
      prompt: 'The author asserts that traditional frameworks offer indispensable [ 37 ] for the 21st century.',
      correctAnswer: ['design principles', 'principles'],
      explanation: 'Paragraph F concludes paradigms provide indispensable design principles.',
    },
    // Final inference: 38 - 40
    {
      id: `${test.id}-r38`,
      number: 38,
      part: 3,
      type: 'true_false_not_given',
      instruction: 'Do the following statements agree with the claims of the writer in Reading Passage 3?\nWrite YES, NO, or NOT GIVEN.',
      prompt: 'Initial academic hypotheses were confirmed by twentieth-century computational tests.',
      correctAnswer: 'FALSE',
      explanation: 'Paragraph A notes initial hypotheses were substantially revised by subsequent field data.',
    },
    {
      id: `${test.id}-r39`,
      number: 39,
      part: 3,
      type: 'true_false_not_given',
      instruction: 'Write YES, NO, or NOT GIVEN.',
      prompt: 'The research team received financial rewards from patent licensing agreements.',
      correctAnswer: 'NOT GIVEN',
      explanation: 'No mention of financial compensation or patent royalty distributions appears in the passage.',
    },
    {
      id: `${test.id}-r40`,
      number: 40,
      part: 3,
      type: 'true_false_not_given',
      instruction: 'Write YES, NO, or NOT GIVEN.',
      prompt: 'The author believes traditional methodologies remain valuable for addressing modern sustainability.',
      correctAnswer: 'TRUE',
      explanation: 'Paragraph F explicitly affirms that heritage frameworks supply vital principles for contemporary challenges.',
    },
  ];

  return {
    id: `${test.id}-reading-section`,
    title: 'Cambridge Academic Reading Test',
    totalQuestions: 40,
    timeAllowedMinutes: 60,
    parts: [
      {
        partNumber: 1,
        title: p1Title,
        instructions: 'Read the passage below and answer Questions 1–14.',
        passageTitle: p1Title,
        passageParagraphs: generatePassageContent(p1Title, bookNumber, 1),
        questions: p1Questions,
      },
      {
        partNumber: 2,
        title: p2Title,
        instructions: 'Read the passage below and answer Questions 15–27.',
        passageTitle: p2Title,
        passageParagraphs: generatePassageContent(p2Title, bookNumber, 2),
        questions: p2Questions,
      },
      {
        partNumber: 3,
        title: p3Title,
        instructions: 'Read the passage below and answer Questions 28–40.',
        passageTitle: p3Title,
        passageParagraphs: generatePassageContent(p3Title, bookNumber, 3),
        questions: p3Questions,
      },
    ],
  };
}

/**
 * Generate 40 questions for the 4 listening sections of a Cambridge test
 */
function generateCambridgeListeningSection(test: CambridgeTestSummary, bookNumber: number): MockSectionData {
  const baseTheme = test.listeningTheme;

  return {
    id: `${test.id}-listening-section`,
    title: `Cambridge Academic Listening Test (Book ${bookNumber})`,
    totalQuestions: 40,
    timeAllowedMinutes: 32,
    parts: [
      {
        partNumber: 1,
        title: `Part 1: Customer Consultation Form (${baseTheme.split('·')[0]?.trim() || 'Logistics Enquiry'})`,
        instructions: 'Complete the notes below. Write NO MORE THAN TWO WORDS AND/OR A NUMBER for each answer.',
        audioUrl: '/audio/section-1.mp3',
        questions: [
          {
            id: `${test.id}-l1`,
            number: 1,
            part: 1,
            type: 'fill_in_the_blank',
            instruction: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER',
            prompt: 'Client Reference Name: [ 1 ]',
            correctAnswer: ['Sarah Jenkins', 'Jenkins'],
            explanation: 'The caller confirms her name is Sarah Jenkins.',
          },
          {
            id: `${test.id}-l2`,
            number: 2,
            part: 1,
            type: 'fill_in_the_blank',
            instruction: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER',
            prompt: 'Preferred Start Date: [ 2 ]',
            correctAnswer: ['14th October', '14 October', 'October 14'],
            explanation: 'Speaker specifies starting on the 14th of October.',
          },
          {
            id: `${test.id}-l3`,
            number: 3,
            part: 1,
            type: 'fill_in_the_blank',
            instruction: 'Write NO MORE THAN TWO WORDS',
            prompt: 'Primary Objective: [ 3 ] assessment',
            correctAnswer: ['technical', 'feasibility'],
            explanation: 'The representative states the initial milestone is a technical assessment.',
          },
          {
            id: `${test.id}-l4`,
            number: 4,
            part: 1,
            type: 'fill_in_the_blank',
            instruction: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER',
            prompt: 'Total Allocated Budget: £[ 4 ]',
            correctAnswer: ['1250', '1,250', 'twelve hundred fifty'],
            explanation: 'The agreed ceiling budget is £1,250.',
          },
          {
            id: `${test.id}-l5`,
            number: 5,
            part: 1,
            type: 'fill_in_the_blank',
            instruction: 'Write NO MORE THAN TWO WORDS',
            prompt: 'Special Equipment Required: [ 5 ]',
            correctAnswer: ['protective footwear', 'boots', 'safety boots'],
            explanation: 'The guide explicitly requires protective footwear for site entry.',
          },
          {
            id: `${test.id}-l6`,
            number: 6,
            part: 1,
            type: 'fill_in_the_blank',
            instruction: 'Write NO MORE THAN TWO WORDS',
            prompt: 'Emergency Contact Person: [ 6 ]',
            correctAnswer: ['David Harrison', 'Harrison'],
            explanation: 'David Harrison is listed as the supervisor on duty.',
          },
          {
            id: `${test.id}-l7`,
            number: 7,
            part: 1,
            type: 'fill_in_the_blank',
            instruction: 'Write NO MORE THAN TWO WORDS AND/OR A NUMBER',
            prompt: 'Office Telephone Extension: [ 7 ]',
            correctAnswer: ['4892', 'four eight nine two'],
            explanation: 'Direct extension is confirmed as 4892.',
          },
          {
            id: `${test.id}-l8`,
            number: 8,
            part: 1,
            type: 'fill_in_the_blank',
            instruction: 'Write NO MORE THAN TWO WORDS',
            prompt: 'Collection Point: Outside the [ 8 ] entrance',
            correctAnswer: ['northern', 'north'],
            explanation: 'Meeting point is stationed at the northern entrance.',
          },
          {
            id: `${test.id}-l9`,
            number: 9,
            part: 1,
            type: 'fill_in_the_blank',
            instruction: 'Write NO MORE THAN TWO WORDS',
            prompt: 'Dietary Preference: [ 9 ] meal provided',
            correctAnswer: ['vegetarian', 'plant-based'],
            explanation: 'The lunch coordinator accommodates vegetarian meals.',
          },
          {
            id: `${test.id}-l10`,
            number: 10,
            part: 1,
            type: 'fill_in_the_blank',
            instruction: 'Write NO MORE THAN TWO WORDS',
            prompt: 'Documentation Needed: Valid photographic [ 10 ]',
            correctAnswer: ['identification', 'ID'],
            explanation: 'Security requires valid photographic identification.',
          },
        ],
      },
      {
        partNumber: 2,
        title: 'Part 2: Community Facility Orientation & Map Briefing',
        instructions: 'Choose the correct letter, A, B, or C.',
        audioUrl: '/audio/section-2.mp3',
        questions: Array.from({ length: 10 }, (_, idx) => {
          const num = 11 + idx;
          return {
            id: `${test.id}-l${num}`,
            number: num,
            part: 2,
            type: 'multiple_choice' as const,
            instruction: 'Choose the correct letter, A, B, or C.',
            prompt: `Question ${num}: Which area of the redevelopment project is scheduled for completion first?`,
            options: [
              'A. The central atrium and botanical conservatory',
              'B. The western multimodal bicycle docking terminal',
              'C. The heritage acoustic performance hall',
            ],
            correctAnswer: idx % 3 === 0 ? 'B' : idx % 3 === 1 ? 'A' : 'C',
            explanation: 'The director confirms the bicycle terminal opens prior to the conservatory.',
          };
        }),
      },
      {
        partNumber: 3,
        title: 'Part 3: Academic Student Seminar Discussion',
        instructions: 'Choose the correct letter, A, B, or C.',
        audioUrl: '/audio/section-3.mp3',
        questions: Array.from({ length: 10 }, (_, idx) => {
          const num = 21 + idx;
          return {
            id: `${test.id}-l${num}`,
            number: num,
            part: 3,
            type: 'multiple_choice' as const,
            instruction: 'Choose the correct letter, A, B, or C.',
            prompt: `Question ${num}: What did the research team find most surprising during the statistical analysis?`,
            options: [
              'A. The consistency of user behavioral patterns across age groups',
              'B. The sharp discrepancy in seasonal power demand projections',
              'C. The lack of correlation between cost subsidies and public uptake',
            ],
            correctAnswer: idx % 2 === 0 ? 'C' : 'A',
            explanation: 'Both students agree that lack of correlation with subsidies was unexpected.',
          };
        }),
      },
      {
        partNumber: 4,
        title: 'Part 4: University Research Lecture',
        instructions: 'Complete the notes below. Write ONE WORD ONLY for each answer.',
        audioUrl: '/audio/section-4.mp3',
        questions: Array.from({ length: 10 }, (_, idx) => {
          const num = 31 + idx;
          const answers = ['sediment', 'acoustic', 'humidity', 'pressure', 'salinity', 'mycelium', 'resilience', 'catalyst', 'equilibrium', 'nitrogen'];
          const ans = answers[idx] || 'sediment';
          return {
            id: `${test.id}-l${num}`,
            number: num,
            part: 4,
            type: 'fill_in_the_blank' as const,
            instruction: 'Write ONE WORD ONLY from the lecture',
            prompt: `- Crucial ecological variable recorded: [ ${num} ] concentration`,
            correctAnswer: [ans, ans.toUpperCase()],
            explanation: `The lecturer explicitly highlights ${ans} concentration as the critical index.`,
          };
        }),
      },
    ],
  };
}

/**
 * Generate full writing tasks matching the selected Cambridge test
 */
function generateCambridgeWritingSection(test: CambridgeTestSummary, bookNumber: number) {
  return {
    task1: {
      taskNumber: 1 as const,
      title: `Writing Task 1: Academic Report (Cambridge ${bookNumber})`,
      minWords: 150,
      recommendedMinutes: 20,
      instructions: 'You should spend about 20 minutes on this task. Summarise the information by selecting and reporting the main features, and make comparisons where relevant. Write at least 150 words.',
      prompt: test.writingTask1,
      chartDetails: {
        type: 'Comparative Chart Analysis',
        title: test.writingTask1,
        labels: ['Metric A', 'Metric B', 'Metric C', 'Metric D'],
        dataPoints: [
          { category: 'Baseline (2012)', value2010: 12.5, value2025: 18.2, unit: '%' },
          { category: 'Interim (2018)', value2010: 24.8, value2025: 39.4, unit: '%' },
          { category: 'Projected (2024)', value2010: 48.1, value2025: 72.6, unit: '%' },
          { category: 'Target Benchmark', value2010: 65.0, value2025: 85.0, unit: '%' },
        ],
      },
      sampleBand8Response: `The provided graphic illustrates significant shifts across key indicators over the documented timeframe. Overall, it is immediately apparent that all sectors experienced progressive upward trajectories, with renewable allocations demonstrating the most dramatic expansion by the end of the survey window.

In the initial observation period, baseline figures remained comparatively modest, registering just 12.5% across primary categories. However, steady investments catalyzed a notable surge over subsequent reporting cycles, doubling baseline outputs before reaching a peak of over 72% in the most recent assessment. In contrast, legacy benchmarks exhibited much slower, incremental adjustments, trailing cutting-edge installations throughout the recorded survey.`,
      examinerChecklist: [
        'Clear academic overview presented in opening paragraphs',
        'Key trends, peaks, and troughs accurately contrasted',
        'Data accurately reported without personal commentary',
        'Cohesive devices and formal academic vocabulary utilized effectively',
      ],
    },
    task2: {
      taskNumber: 2 as const,
      title: `Writing Task 2: Discursive Essay (Cambridge ${bookNumber})`,
      minWords: 250,
      recommendedMinutes: 40,
      instructions: 'You should spend about 40 minutes on this task. Write about the following topic. Give reasons for your answer and include any relevant examples from your own knowledge or experience. Write at least 250 words.',
      prompt: test.writingTask2,
      sampleBand8Response: `The question of whether ${test.writingTask2.toLowerCase()} has sparked considerable debate in contemporary public discourse. While proponents argue that regulatory enforcement is essential to safeguard societal standards, opponents maintain that autonomous choice and free-market flexibility yield superior long-term outcomes. In this essay, I will examine both perspectives before articulating my own position.

On the one hand, advocates of structured oversight point to the tangible externalities associated with unregulated practices. In fields where public safety, ecological integrity, or economic stability are at stake, centralized protocols ensure baseline competencies and prevent catastrophic failures. For instance, empirical evidence from heavily regulated sectors consistently demonstrates lower incident rates and greater public confidence.

On the other hand, critics argue that excessive mandates stifle grassroots innovation and impose disproportionate compliance costs on smaller institutions. Rigid standardizations often lag behind rapid technological advancements, creating artificial friction that prevents adaptable solutions from taking root organically.

In conclusion, while concerns regarding bureaucratic rigidity are legitimate, the collective benefits of well-calibrated standards outweigh the disadvantages. A balanced framework—combining clear baseline requirements with operational flexibility—represents the most effective path forward.`,
      examinerChecklist: [
        'Prompt fully answered with clear position maintained throughout',
        'Well-developed body paragraphs with supporting examples',
        'Broad range of lexical items with accurate collocation',
        'Complex grammatical structures with high grammatical accuracy',
      ],
    },
  };
}

/**
 * Main retrieval function: resolves ANY Cambridge test ID (c10-t1 through c19-t4),
 * custom imported test ID, or default mock dataset.
 */
export function getExamDatasetById(examId: string): FullMockExamDataset {
  // 1. Check user imported custom tests in localStorage
  if (typeof window !== 'undefined') {
    const customTests = getStoredCustomTests();
    const foundCustom = customTests.find((t) => t.examId === examId);
    if (foundCustom) {
      return foundCustom;
    }
  }

  // 2. Default CDT Mock
  if (!examId || examId === 'cambridge-cdt-mock-01' || examId === 'default') {
    return OFFICIAL_CAMBRIDGE_MOCK_DATA;
  }

  // 3. Look up in Cambridge Books Catalog (Books 10 - 19)
  for (const book of CAMBRIDGE_BOOKS_CATALOG) {
    const foundTest = book.tests.find((t) => t.id === examId);
    if (foundTest) {
      return {
        examId: foundTest.id,
        examCode: `IELTS-CAM-${book.bookNumber}-0${foundTest.testNumber}`,
        title: foundTest.title,
        candidateNameDefault: 'Sarah Jenkins',
        candidateIdDefault: `48${book.bookNumber}0${foundTest.testNumber}`,
        testCenterCode: `IA008 - Cambridge Assessment English (Book ${book.bookNumber})`,
        listening: generateCambridgeListeningSection(foundTest, book.bookNumber),
        reading: generateCambridgeReadingSection(foundTest, book.bookNumber),
        writing: generateCambridgeWritingSection(foundTest, book.bookNumber),
      };
    }
  }

  // Fallback to official mock data
  return OFFICIAL_CAMBRIDGE_MOCK_DATA;
}

/**
 * Returns a list of all tests available across Cambridge 10-19 and custom imports
 */
export function getAllAvailableMockTests(): {
  id: string;
  title: string;
  bookNumber?: number;
  testNumber?: number;
  badge?: string;
  isCustom?: boolean;
}[] {
  const result: {
    id: string;
    title: string;
    bookNumber?: number;
    testNumber?: number;
    badge?: string;
    isCustom?: boolean;
  }[] = [];

  // Default Mock
  result.push({
    id: 'cambridge-cdt-mock-01',
    title: 'Cambridge Official Computer-Delivered Mock 01 (Freight Logistics & Andean Terraces)',
    badge: 'Official Benchmark',
  });

  // Custom tests
  if (typeof window !== 'undefined') {
    const customTests = getStoredCustomTests();
    customTests.forEach((ct) => {
      result.push({
        id: ct.examId,
        title: ct.title,
        badge: 'Custom Imported',
        isCustom: true,
      });
    });
  }

  // Cambridge Books 19 down to 10
  for (const book of CAMBRIDGE_BOOKS_CATALOG) {
    for (const test of book.tests) {
      result.push({
        id: test.id,
        title: test.title,
        bookNumber: book.bookNumber,
        testNumber: test.testNumber,
        badge: `Cambridge ${book.bookNumber}`,
      });
    }
  }

  return result;
}
