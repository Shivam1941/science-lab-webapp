const fs = require('fs');

const newExperiments = [
    {
      id: "filtration_technique",
      title: "Filtration",
      description: "Separate an insoluble solid from a liquid using a filter funnel and paper.",
      icon: "⚗️",
      iconBg: "rgba(14, 165, 233, 0.15)",
      iconColor: "#0ea5e9",
      aim: "To separate an insoluble solid (like chalk/sand) from a liquid (water) using the process of filtration.",
      apparatus: ["Beaker", "Filter paper", "Glass funnel", "Conical flask", "Glass rod", "Mixture of sand and water"],
      procedure: ["Fold the filter paper into a cone and place it into the glass funnel.", "Place the funnel over a conical flask.", "Gently pour the mixture of sand and water into the funnel using a glass rod.", "Observe the clear water (filtrate) collecting in the flask.", "Observe the sand particles (residue) remaining on the filter paper."],
      precautions: ["Wet the filter paper slightly so it sticks to the funnel.", "Pour the mixture slowly to avoid overflowing the filter paper.", "Use a glass rod to guide the liquid into the funnel."],
      conclusion: "Filtration effectively separates insoluble solids from liquids. The clear liquid collected is the filtrate, and the solid left behind is the residue."
    },
    {
      id: "evaporation_technique",
      title: "Evaporation",
      description: "Separate a dissolved solid from a liquid by heating and evaporating the solvent.",
      icon: "♨️",
      iconBg: "rgba(239, 68, 68, 0.15)",
      iconColor: "#ef4444",
      aim: "To separate a dissolved solid solute (like salt) from its solvent (water) by the process of evaporation.",
      apparatus: ["China dish", "Tripod stand", "Wire gauze", "Bunsen burner", "Salt solution (salt dissolved in water)"],
      procedure: ["Pour the salt water solution into the china dish.", "Place the china dish on the wire gauze over the tripod stand.", "Light the Bunsen burner and gently heat the solution.", "Continue heating until all the water evaporates.", "Observe the white solid residue left behind in the dish."],
      precautions: ["Heat gently to avoid spattering of the hot solution.", "Do not evaporate to complete dryness rapidly, to avoid charring.", "Use tongs to handle the hot china dish."],
      conclusion: "Evaporation separates a volatile solvent from a non-volatile solute. The water turns into vapor, leaving the solid salt behind."
    },
    {
      id: "distillation_technique",
      title: "Distillation",
      description: "Separate miscible liquids with different boiling points or purify a liquid containing dissolved impurities.",
      icon: "💧",
      iconBg: "rgba(59, 130, 246, 0.15)",
      iconColor: "#3b82f6",
      aim: "To separate a mixture of two miscible liquids with a sufficient difference in boiling points, or to purify a liquid by distillation.",
      apparatus: ["Distillation flask", "Thermometer", "Liebig condenser", "Receiving flask", "Bunsen burner", "Cork with holes"],
      procedure: ["Place the mixture into the distillation flask.", "Fit the flask with a thermometer and connect it to the Liebig condenser.", "Place the receiving flask at the end of the condenser.", "Heat the flask gently. The liquid with the lower boiling point evaporates first.", "The vapors pass through the condenser, cool down, and liquefy.", "The pure liquid (distillate) collects in the receiving flask."],
      precautions: ["Add boiling chips to the distillation flask for smooth boiling.", "Ensure cold water flows into the condenser from the lower end and out from the upper end.", "Monitor the temperature carefully to identify the boiling component."],
      conclusion: "Distillation separates components based on boiling point differences. The lower boiling component evaporates, condenses, and is collected as distillate."
    },
    {
      id: "fractional_distillation",
      title: "Fractional Distillation",
      description: "Separate a mixture of miscible liquids with closely related boiling points using a fractionating column.",
      icon: "🌡️",
      iconBg: "rgba(168, 85, 247, 0.15)",
      iconColor: "#a855f7",
      aim: "To separate two or more miscible liquids with boiling points differing by less than 25 K using fractional distillation.",
      apparatus: ["Distillation flask", "Fractionating column (packed with glass beads)", "Thermometer", "Condenser", "Receiving flask", "Heat source"],
      procedure: ["Set up the distillation apparatus with a fractionating column placed between the flask and condenser.", "Heat the mixture. Vapors of both liquids rise into the fractionating column.", "The column provides surface area for repeated condensation and vaporization.", "The more volatile liquid reaches the top first, enters the condenser, and is collected.", "Once the first liquid is completely distilled, the temperature rises, and the second liquid distills."],
      precautions: ["Heat the mixture very slowly and steadily.", "Wrap the fractionating column with insulator if necessary to prevent heat loss.", "Change the receiving flask immediately when the temperature jumps."],
      conclusion: "The fractionating column allows multiple evaporation-condensation cycles, resulting in efficient separation of liquids with close boiling points."
    },
    {
      id: "chromatography_technique",
      title: "Paper Chromatography",
      description: "Separate the different colored dyes present in black ink using a solvent and filter paper.",
      icon: "📜",
      iconBg: "rgba(16, 185, 129, 0.15)",
      iconColor: "#10b981",
      aim: "To separate the components of a mixture (like dyes in black ink) based on their different solubilities in a solvent.",
      apparatus: ["Strip of filter paper (chromatography paper)", "Capillary tube", "Beaker/Glass jar with lid", "Paper clip / Glass rod", "Black ink spot", "Solvent (Water or alcohol)"],
      procedure: ["Draw a pencil line about 3 cm from the bottom of the filter paper strip.", "Put a small drop of black ink in the center of the pencil line.", "Pour a small amount of solvent into the jar.", "Suspend the paper strip in the jar so the tip is in the solvent, but the ink spot is above the solvent level.", "Cover the jar and let the solvent rise up the paper.", "Observe the separation of colors as the solvent moves upward."],
      precautions: ["Ensure the ink spot does not submerge directly in the solvent.", "Cover the jar to prevent solvent evaporation.", "Remove the paper before the solvent front reaches the very top."],
      conclusion: "Chromatography separates mixture components based on how fast they travel with the solvent. Different dyes in the black ink have different solubilities and rise at different rates."
    }
];

function updateFile(filePath, isAppJs) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find where the chemistry array ends.
    // In both files, there is a `chemistry: [\n ... \n  ],` 
    // We look for the last experiment in chemistry.
    let searchStr = isAppJs ? 
        "conclusion: 'Soap produces more and longer-lasting foam in soft water. In hard water, soap reacts with Ca²⁺/Mg²⁺ ions to form an insoluble scum, reducing its cleaning ability.'\n    }" :
        "conclusion: 'Soap produces more and longer-lasting foam in soft water. In hard water, soap reacts with Ca²⁺/Mg²⁺ ions to form an insoluble scum, reducing its cleaning ability.'\n    }";

    if (!content.includes(searchStr)) {
        console.log("Could not find the insertion point in " + filePath);
        return;
    }

    let injectionString = "";
    newExperiments.forEach(exp => {
        injectionString += ",\n    {\n";
        injectionString += `      id: "${exp.id}",\n`;
        injectionString += `      title: "${exp.title}",\n`;
        injectionString += `      description: "${exp.description}",\n`;
        injectionString += `      icon: "${exp.icon}",\n`;
        injectionString += `      iconBg: "${exp.iconBg}",\n`;
        injectionString += `      iconColor: "${exp.iconColor}",\n`;
        injectionString += `      aim: "${exp.aim}",\n`;
        injectionString += `      apparatus: ${JSON.stringify(exp.apparatus)},\n`;
        injectionString += `      procedure: ${JSON.stringify(exp.procedure)},\n`;
        injectionString += `      precautions: ${JSON.stringify(exp.precautions)},\n`;
        injectionString += `      conclusion: "${exp.conclusion}"\n`;
        injectionString += "    }";
    });

    let newContent = content.replace(searchStr, searchStr + injectionString);
    
    if (isAppJs) {
        // We also need to update the total counts or they might get mismatched, but app.js calculates it dynamically!
    }

    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log("Updated " + filePath);
}

updateFile('assets/js/app.js', true);
updateFile('experiments.json', false);

