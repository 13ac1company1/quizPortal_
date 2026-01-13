// src/constitutionData.js
// Classroom-friendly summaries + deeper explanations.
// Plain JS, no optional chaining.

var ConstitutionData = {
  title: "U.S. Constitution & Bill of Rights",

  // Concise summaries (used in Learn tab + quick browsing)
  articles: [
    {
      id: "ART1",
      title: "Article I — Legislative Branch",
      text: [
        "Creates Congress with two houses: Senate and House of Representatives.",
        "Describes lawmaking and enumerated powers: taxing, spending, regulating commerce, declaring war.",
        "Lists limits on Congress and on the states."
      ]
    },
    {
      id: "ART2",
      title: "Article II — Executive Branch",
      text: [
        "Establishes the Presidency and Vice Presidency.",
        "Power to enforce laws, act as commander in chief, negotiate treaties (with Senate), and make appointments.",
        "Impeachment rules for executive officers."
      ]
    },
    {
      id: "ART3",
      title: "Article III — Judicial Branch",
      text: [
        "Creates the Supreme Court and allows lower federal courts.",
        "Defines jurisdiction and guarantees criminal jury trials.",
        "Defines treason and its proof."
      ]
    },
    {
      id: "ART4",
      title: "Article IV — States & Union",
      text: [
        "Full Faith and Credit; privileges and immunities.",
        "Rules for admitting new states; federal authority over territories.",
        "Guarantee of a republican form of government to each state."
      ]
    },
    {
      id: "ART5",
      title: "Article V — Amendments",
      text: [
        "Explains how to amend the Constitution.",
        "Proposals by two-thirds of Congress or a convention; ratification by three-fourths of states."
      ]
    },
    {
      id: "ART6",
      title: "Article VI — Supremacy",
      text: [
        "Constitution, federal laws, and treaties are the supreme law of the land.",
        "No religious tests for federal office."
      ]
    },
    {
      id: "ART7",
      title: "Article VII — Ratification",
      text: [
        "Describes the original ratification process by the states."
      ]
    }
  ],

  amendments: [
    { id: "AMD1", number: 1,  title: "1st Amendment — Freedoms",            text: ["Freedom of religion, speech, press, assembly, petition."], key: "freedoms" },
    { id: "AMD2", number: 2,  title: "2nd Amendment — Bear Arms",           text: ["Right to keep and bear arms."], key: "arms" },
    { id: "AMD3", number: 3,  title: "3rd Amendment — Quartering",          text: ["No quartering of soldiers in homes without consent (in peacetime)."], key: "quartering" },
    { id: "AMD4", number: 4,  title: "4th Amendment — Searches",            text: ["No unreasonable searches/seizures; warrants need probable cause."], key: "searches" },
    { id: "AMD5", number: 5,  title: "5th Amendment — Due Process",         text: ["Due process; no double jeopardy; no self-incrimination; just compensation for takings."], key: "due process" },
    { id: "AMD6", number: 6,  title: "6th Amendment — Criminal Trials",     text: ["Speedy, public trial; impartial jury; know charges; confront witnesses; counsel."], key: "trial rights" },
    { id: "AMD7", number: 7,  title: "7th Amendment — Civil Jury",          text: ["Jury trial in certain civil cases; limits on re-examining facts tried by a jury."], key: "civil jury" },
    { id: "AMD8", number: 8,  title: "8th Amendment — Punishment",          text: ["No excessive bail/fines; no cruel and unusual punishment."], key: "punishment" },
    { id: "AMD9", number: 9,  title: "9th Amendment — Unenumerated Rights", text: ["People retain rights not listed in the Constitution."], key: "unenumerated" },
    { id: "AMD10", number: 10, title: "10th Amendment — Reserved Powers",   text: ["Powers not given to the federal government are reserved to the states or the people."], key: "reserved powers" }
  ],

  // Deep Dive (richer explanations used in the Deep Dive tab)
  deepArticles: [
    {
      id: "D_ART1",
      ref: "ART1",
      title: "Article I — How Congress Works (Deep Dive)",
      bullets: [
        "Bicameral Congress balances equal state voice (Senate) and population-based voice (House).",
        "Enumerated powers: taxes, spending, commerce, post offices, patents, war/army/navy, and more.",
        "Necessary and Proper Clause lets Congress pass laws to carry out its powers.",
        "Limits: no bills of attainder, no ex post facto laws; sets rules about money and titles.",
        "House originates revenue bills; Senate confirms many presidential appointments and treaties."
      ],
      classroom: "Think of Article I as the rulebook for writing national laws and overseeing national policy."
    },
    {
      id: "D_ART2",
      ref: "ART2",
      title: "Article II — The Presidency (Deep Dive)",
      bullets: [
        "President enforces laws, oversees federal agencies, and leads foreign policy.",
        "Commander in Chief of the armed forces; can deploy military subject to laws and funding.",
        "Treaties require Senate approval; appointments often require Senate confirmation.",
        "Impeachment: House accuses; Senate holds trial. Grounds include treason, bribery, or other high crimes."
      ],
      classroom: "Article II ensures one accountable executive can act decisively while remaining limited by law."
    },
    {
      id: "D_ART3",
      ref: "ART3",
      title: "Article III — Federal Courts (Deep Dive)",
      bullets: [
        "Supreme Court sits at the top; Congress may create lower federal courts.",
        "Judicial power covers federal laws, treaties, the Constitution, and disputes among states or with the U.S.",
        "Judges hold office during good behavior (life tenure) to boost independence.",
        "Treason is narrowly defined; requires two witnesses or confession in open court."
      ],
      classroom: "Article III empowers courts to say what the law is, protecting rights and balancing powers."
    },
    {
      id: "D_ART4",
      ref: "ART4",
      title: "Article IV — States Working Together (Deep Dive)",
      bullets: [
        "States recognize each other’s public acts and court decisions (Full Faith and Credit).",
        "Citizens enjoy privileges and immunities across states; rules for extradition.",
        "Congress admits new states; federal government protects states against invasion and domestic violence."
      ],
      classroom: "Article IV keeps the states stitched together into one nation."
    },
    {
      id: "D_ART5",
      ref: "ART5",
      title: "Article V — Changing the Constitution (Deep Dive)",
      bullets: [
        "Amendments proposed by two-thirds of both Houses or a convention called by two-thirds of states.",
        "Amendments become law when ratified by three-fourths of states (legislatures or conventions).",
        "Ensures the Constitution can adapt while requiring broad agreement."
      ],
      classroom: "Article V = safety valve: stable but flexible."
    },
    {
      id: "D_ART6",
      ref: "ART6",
      title: "Article VI — The Supreme Law (Deep Dive)",
      bullets: [
        "Supremacy Clause: federal law overrides conflicting state law.",
        "All officials swear to support the Constitution; no religious tests allowed."
      ],
      classroom: "Article VI makes one clear rulebook for the entire country."
    },
    {
      id: "D_ART7",
      ref: "ART7",
      title: "Article VII — Getting Started (Deep Dive)",
      bullets: [
        "Explains how the original states approved the Constitution to launch the new government."
      ],
      classroom: "Article VII is the final “start button” for the Constitution."
    }
  ],

  deepAmendments: [
    {
      id: "D_AMD1",
      ref: "AMD1",
      title: "1st Amendment — Five Freedoms (Deep Dive)",
      bullets: [
        "Religion: government can’t establish a religion or stop free exercise.",
        "Speech & Press: protect expression and news—even when critical of government.",
        "Assembly & Petition: people may gather and ask government to fix problems."
      ],
      classroom: "The First Amendment protects open debate so democracy can work."
    },
    {
      id: "D_AMD2",
      ref: "AMD2",
      title: "2nd Amendment — Bearing Arms (Deep Dive)",
      bullets: [
        "Historic tie to militias and self-defense.",
        "Modern debates center on scope of regulation vs. individual rights."
      ],
      classroom: "A short text with big conversations about safety and liberty."
    },
    {
      id: "D_AMD3",
      ref: "AMD3",
      title: "3rd Amendment — Quartering (Deep Dive)",
      bullets: [
        "A response to colonial abuses—protects privacy of the home.",
        "Rarely litigated today but symbolizes limits on military power in civilian life."
      ],
      classroom: "Home is off-limits for troops without consent in peacetime."
    },
    {
      id: "D_AMD4",
      ref: "AMD4",
      title: "4th Amendment — Privacy & Warrants (Deep Dive)",
      bullets: [
        "Police usually need a warrant based on probable cause.",
        "Protects people, houses, papers, and effects.",
        "Courts define what counts as a reasonable search, including technology issues."
      ],
      classroom: "Balances safety with privacy rights."
    },
    {
      id: "D_AMD5",
      ref: "AMD5",
      title: "5th Amendment — Due Process (Deep Dive)",
      bullets: [
        "Grand juries, double jeopardy, self-incrimination protections.",
        "Due process: fair procedures before government takes life, liberty, or property.",
        "Takings Clause: compensation when government takes private property."
      ],
      classroom: "Fairness rules for government power."
    },
    {
      id: "D_AMD6",
      ref: "AMD6",
      title: "6th Amendment — Fair Criminal Trials (Deep Dive)",
      bullets: [
        "Speedy, public trial; impartial jury; confront accusers; know charges; compulsory process; counsel.",
        "These ensure reliability and transparency in criminal justice."
      ],
      classroom: "Protects the accused from secret or unfair trials."
    },
    {
      id: "D_AMD7",
      ref: "AMD7",
      title: "7th Amendment — Civil Jury (Deep Dive)",
      bullets: [
        "Jury trial preserved in certain civil disputes.",
        "Limits re-examining jury-decided facts."
      ],
      classroom: "Community voice in civil courts."
    },
    {
      id: "D_AMD8",
      ref: "AMD8",
      title: "8th Amendment — Limits on Punishment (Deep Dive)",
      bullets: [
        "No excessive bail or fines.",
        "No cruel and unusual punishment; standards can evolve with society."
      ],
      classroom: "Punishment must be just, not degrading."
    },
    {
      id: "D_AMD9",
      ref: "AMD9",
      title: "9th Amendment — Other Rights Exist (Deep Dive)",
      bullets: [
        "Listing some rights doesn’t deny others people hold.",
        "Warns against reading the Constitution too narrowly."
      ],
      classroom: "Rights aren’t limited to the list."
    },
    {
      id: "D_AMD10",
      ref: "AMD10",
      title: "10th Amendment — Federalism Balance (Deep Dive)",
      bullets: [
        "Reserves undelegated powers to the states or the people.",
        "A key anchor for state authority in our federal system."
      ],
      classroom: "Who decides? Often, the states do."
    }
  ]
};

export default ConstitutionData;
