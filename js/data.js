/* =====================================================================
   AZ2NEXTHOOPS — scouting data file (SOURCE OF TRUTH for the public site)
   ---------------------------------------------------------------------
   You normally do NOT edit this by hand. Use the Admin panel in the site
   (unlock with your password, then click "+ Add Report" or "Edit").
   When you're done, click "Publish" to download a new copy of this file,
   then replace this file on your host. See README.md for details.
   ===================================================================== */

window.SEED_DATA = {
  /* bump this whenever you Publish. Used to keep your browser in sync
     with the latest published file. */
  dataVersion: 1,

  brand: "AZ2NEXTHOOPS",
  tagline: "Scouting Reports & Ranked Boards",

  levels: ["NBA", "College", "G-League", "International"],
  positions: ["PG", "SG", "SF", "PF", "C"],

  boardCategories: [
    { id: "overall",  label: "Overall Board",            byPosition: false },
    { id: "shooters", label: "Best Shooters",             byPosition: false },
    { id: "defenders",label: "Best Defenders",            byPosition: false },
    { id: "guards",   label: "Best Guards",               byPosition: true  },
    { id: "wings",    label: "Best Wings",                byPosition: true  },
    { id: "bigs",     label: "Best Bigs",                 byPosition: true  },
    { id: "twoway",   label: "Best 2-Way Candidates",     byPosition: false }
  ],

  players: [
    /* ---------- SAMPLE REPORTS — delete these anytime in Admin ---------- */
    {
      id: "p_sample_carter",
      name: "[SAMPLE] DeShawn Carter",
      level: "College",
      position: "PG",
      team: "Lakeside State (sample)",
      vitals: { height: "6'2\"", weight: "185", age: "20", classYear: "Sophomore", handedness: "Right" },
      objective: "Efficient, low-maintenance lead guard who projects as a reliable backup floor general. Buy-in role player whose value comes from decision-making and catch-and-shoot reliability rather than self-creation volume.",
      role: "Backup PG / second-unit lead guard; developmental 3-and-D point if the frame fills out.",
      strengths: [
        "Repeatable catch-and-shoot mechanics that hold up from NBA three-point range.",
        "Quickly reads ball-screen coverages and makes the simple, correct pass.",
        "Low turnover profile within structured half-court offense."
      ],
      questions: [
        "Can he stay in front of bigger, longer NBA point guards?",
        "Does his handle survive extended pressure and blitzes?",
        "Is there enough burst to turn the corner against elite closeouts?"
      ],
      analysis: {
        shooting: {
          mechanics: "Clean, repeatable set point; elbows aligned; consistent one-motion release. Holds form under fatigue in the sample reviewed.",
          rangeVolume: "38% from three on ~4 attempts/game — volume is in the flow of the offense, not forced. Range translates to the NBA line on open looks.",
          shotSelection: "Understands spacing and role; rarely forces. Downhill + catch-and-shoot diet is clean — almost no hero-ball possessions.",
          offMovement: "Coming off flares and DHOs the footwork is a repeatable 1-2. Reliable relocation when the primary action breaks."
        },
        creation: { changeOfPace: "", separation: "", finishing: "", selfVsScheme: "" },
        passing: {
          liveVision: "Sees the second side off live dribble and delivers ahead of the rotation.",
          processing: "Anticipates tag rotations; rarely late on the read.",
          decisions: "",
          feel: ""
        },
        defense: { onBall: "", offBall: "", versatility: "", effort: "" },
        athletic: { sizeLength: "", speed: "Average burst; plays at a controlled pace rather than exploding by defenders.", vertical: "", strength: "" },
        rebounding: { boxOut: "", timing: "", screening: "", physicality: "" },
        offball: { cutting: "", spacing: "", relocation: "", navigation: "" },
        makeup: { motor: "", coachability: "", adversity: "", leadership: "" }
      },
      context: {
        age: "20 (Sophomore)",
        role: "Starter, primary ball-handler in a structured system.",
        competition: "High-major conference; tested against multiple tournament-level guards.",
        physicalGrowth: "Frame can add strength; question is whether quickness holds as he fills out.",
        mentalAdaptability: "Stays within role; hasn't yet been asked to carry a heavy creation load.",
        referencePoints: "Positive: low-usage backup PGs who survive on IQ and shooting. Caution: guards whose lack of burst got exposed at the next level."
      },
      updatedAt: 0
    },
    {
      id: "p_sample_rowe",
      name: "[SAMPLE] Marcus Rowe",
      level: "NBA",
      position: "SF",
      team: "Free agent sample",
      vitals: { height: "6'7\"", weight: "215", age: "24", classYear: "", handedness: "Right" },
      objective: "Switchable wing with real two-way utility. Floor is a defensive-minded reserve; ceiling depends on whether the jumper stabilizes enough to stay on the floor late.",
      role: "3-and-D wing reserve; emergency small-ball 4 in specific matchups.",
      strengths: [
        "Defends positions 1 through 4 without scheme help.",
        "Reads passing lanes and converts turnovers into transition offense.",
        "Will 100% accept a low-usage, connective role."
      ],
      questions: [
        "Is the corner three reliable enough to punish defenses that help off him?",
        "Can he hold up as a small-ball 5 in playoff settings?"
      ],
      analysis: {
        shooting: { mechanics: "", rangeVolume: "Career ~34% from three, almost all corner + catch-and-shoot; low volume.", shotSelection: "Disciplined; almost no pull-up threes.", offMovement: "" },
        creation: { changeOfPace: "", separation: "", finishing: "Finishes through contact in the restricted area; limited above-the-rim package.", selfVsScheme: "" },
        passing: { liveVision: "", processing: "", decisions: "Makes the simple swing pass; not a playmaker.", feel: "" },
        defense: {
          onBall: "Slides feet with guards; contests without fouling.",
          offBall: "Strong rotations; recovers from help on time.",
          versatility: "Guards 1-4 comfortably; cross-matches onto stars without breaking the scheme.",
          effort: "Consistent motor on the defensive end."
        },
        athletic: { sizeLength: "6'7\" with a 6'11\" wingspan — plus length for the wing.", speed: "", vertical: "", strength: "Carries 215 well; absorbs contact." },
        rebounding: { boxOut: "", timing: "", screening: "", physicality: "" },
        offball: { cutting: "", spacing: "Spaces to the correct corners; doesn't clog.", relocation: "", navigation: "" },
        makeup: { motor: "", coachability: "", adversity: "", leadership: "" }
      },
      context: {
        age: "24",
        role: "Reserve wing; defensive specialist.",
        competition: "NBA; nightly assignments vs high-usage wings.",
        physicalGrowth: "Near finished product physically.",
        mentalAdaptability: "Embraces role; limited upside to expand usage.",
        referencePoints: "Positive: switchable 3-and-D wings who carved long careers. Caution: wings whose jumper never stabilized and got played off the floor."
      },
      updatedAt: 0
    }
  ],

  /* Ranked boards. Each level keeps its own set of category lists so
     leagues/levels are NEVER mixed. Position boards (guards/wings/bigs)
     are restricted to matching positions when you build them in Admin. */
  boards: {
    "NBA":         { overall: ["p_sample_rowe"], shooters: [], defenders: ["p_sample_rowe"], guards: [], wings: ["p_sample_rowe"], bigs: [], twoway: ["p_sample_rowe"] },
    "College":     { overall: ["p_sample_carter"], shooters: ["p_sample_carter"], defenders: [], guards: ["p_sample_carter"], wings: [], bigs: [], twoway: [] },
    "G-League":    { overall: [], shooters: [], defenders: [], guards: [], wings: [], bigs: [], twoway: [] },
    "International":{ overall: [], shooters: [], defenders: [], guards: [], wings: [], bigs: [], twoway: [] }
  }
};
