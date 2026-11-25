const FireBarrage = () => {
    let barrageInfo = state.EA.currentBarrage;
    let artFormation = Formations[barrageInfo.formationID];
    let artWeapon = barrageInfo.artWeapon;
    let artUnits = barrageInfo.artUnitsIDs.map(id => Units[id]);
    let templates = barrageInfo.templateIDs.map(id => Units[id]);
    let available = 0;

    //run through artUnits, check that have LOS/Range or Indirect, add up BP
    //if has LOS or Range to any 1 template is good
    artLoop1:
    for (let i=0;i<artUnits.length;i++) {
        let artUnit = artUnits[i];

        for (let j=0;j<templates.length;j++) {
            let template = templates[j];
            let losResult = LOS(artUnit,template);
            let distance = losResult.distance;

            if (losResult.los) {
                if ((distance <= artUnit.barrageRange) || (distance >= 12 && distance <= artUnit.barrageRange * 2)) {
                    available++;
                    break;
                }
            } else {
                if (distance >= 12 && distance <= artUnit.barrageRange * 2) {
                    available++;
                    break;
                }
            }
        }
    }

///MW 

    //available is # of units that fire, extraBM is on top of auto 1, AT and AP are the toHit #s needed
    let totalBP = available * artWeapon.fp.replace(/[^\d]/g,"");
    let extraBM = 0;
    if (totalBP > 5) {extraBM++};
    if (totalBP > 9) {extraBM++};
    if (totalBP > 12) {extraBM++};
    if (totalBP > 15) {extraBM++};
    let AP = 6, AT = 6;
    if (totalBP === 2) {AP = 5};
    if (totalBP > 2) {AP = 4; AT = 5};

    //create array of targets under all templates, group by formation
    let targetUnits = [];
    let rad = 1;
    if (artWeapon.name === "Orbital Bombardment") {radius = 2};
    _.each(templates,template => {
        let cubes = HexMap[template.hexLabel].cube.radius(rad);
        _.each(cubes, cube => {
            let ids = HexMap[cube.label()].tokenIDs;
            _.each(ids,id => {
                if (id !== template.id) {
                    targetUnits.push(Units[id]);
                }
            })
        })
    })
    targetUnits.sort((a,b) => 
        a.formationID - b.formationID
    );

    //roll hits, apply damage (damage in class Unit)










}




