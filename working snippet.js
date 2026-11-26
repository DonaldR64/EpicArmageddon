const FireBarrage = () => {
    let barrageInfo = state.EA.currentBarrage;
    let artFormation = Formations[barrageInfo.formationID];
    let artWeapon = barrageInfo.artWeapon;
    let artUnits = barrageInfo.artUnitsIDs.map(id => Units[id]);
    let templates = barrageInfo.templateIDs.map(id => Units[id]);
    let available = 0;
    let indirect = false;
    SetupCard("Barrage","",artFormation.faction);


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
                    indirect = true;
                    break;
                }
            }
        }
    }


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

    //create array of targets under all templates, remove duplicates, group by formation
    let targetIDs = [];
    let rad = 1;
    if (artWeapon.name === "Orbital Bombardment") {radius = 2};
    _.each(templates,template => {
        let cubes = HexMap[template.hexLabel].cube.radius(rad);
        _.each(cubes, cube => {
            let ids = HexMap[cube.label()].tokenIDs;
            _.each(ids,id => {
                if (id !== template.id) {
                    targetIDs.push(id);
                }
            })
        })
    })
    targetIDs = [...new Set(targetIDs)];
    let targetUnits = targetIDs.map(id => Units[id]);
    targetUnits.sort((a,b) => 
        a.formationID - b.formationID
    );

    




    //roll hits, apply damage (damage in class Unit)
    //modify to hit by cover, action (sustained, marshal etc), Ignore Cover,
    let currentFormID = targetUnits[0].formationID;
    let formLeader = Formations[currentFormID.leaderID];
    formLeader.AddBM(1 + extraBM);
    let crossfire = false;
    //crossfire for this formation
    if (indirect === false && artWeapon.name.includes("Orbital") === false) {
        crossfire = Crossfire(artFormation.id,currentFormID);
    }


log(crossfire)



    for (let i=0;i<targetUnits.length;i++) {
        let unit = targetUnits[i];
        if (unit.formationID !== currentFormID) {
//check formation for breaking

            outputCard.body.push("[hr]");
            currentFormID = unit.formationID;
            formLeader = Formations[currentFormID.leaderID];
            formLeader.AddBM(1 + extraBM);
            //crossfire for new formation
            if (indirect === false && artWeapon.name.includes("Orbital") === false) {
                crossfire = Crossfire(artFormation.id,currentFormID);
            }
        }
        if (unit.type === "Infantry" || unit.type === "Light Vehicle") {
            needed = AP;
        } else {
            needed = AT;
        }
        let tip = "Base: " + needed + "+";
        if (artFormation.action === "Sustained Fire") {
            needed--;
            tip += "<br>Sustained Fire +1";
        }
        if (artFormation.action === "Marshal" || artFormation.action === "Double") {
            needed++;
            tip += "<br>" + artFormation.action + " -1";
        }
//only if Direct does losResult cover need to be checked otherwise just the hex

        let cover = losResult.cover; 
        if (unit.type === "Infantry") {cover = HexMap[unit.hexLabel].cover.Infantry};
        if (unit.type === "Infantry" && Formations[unit.formationID].action === "Overwatch") {

//change to the aura
            cover = true;
        }
        if (unit.type.includes("Vehicle")) {cover = HexMap[unit.hexLabel].cover.Vehicle};
        if (cover !== false) {
            if (artWeapon.traits.includes("Ignore Cover")) {
                tip += "<br>Ignores Cover";
            } else {
                needed++;
                tip += "<br>Cover -1";
            }
        }










    }









}




