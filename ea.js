const EA = (() => {
    const version = '2026.11.16';
    if (!state.EA) {state.EA = {}};

    const pageInfo = {};
    const rowLabels = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","AA","AB","AC","AD","AE","AF","AG","AH","AI","AJ","AK","AL","AM","AN","AO","AP","AQ","AR","AS","AT","AU","AV","AW","AX","AY","AZ","BA","BB","BC","BD","BE","BF","BG","BH","BI"];

    const FormationMarkers = ["Plus-1d4::2006401","Minus-1d4::2006429","Plus-1d6::2006402","Minus-1d6::2006434","A::6001458","B::6001459","C::6001460","D::6001461","E::6001462","F::6001463","G::6001464","H::6001465","I::6001466","J::6001467","L::6001468","M::6001469","O::6001471","P::6001472","Q::6001473","R::6001474","S::6001475"];

    let Units = {};
    let Formations = {};
    let HexMap = {}; 
    let strategyFlag = [false,false];
    let Craftworlds = ["Biel-Tan","Ulthwe","Iyanden","Saim-Hann","Exodites"];



    let HexSize, HexInfo, DIRECTIONS;

    //math constants
    const M = {
        f0: Math.sqrt(3),
        f1: Math.sqrt(3)/2,
        f2: 0,
        f3: 3/2,
        b0: Math.sqrt(3)/3,
        b1: -1/3,
        b2: 0,
        b3: 2/3,
    }


    const DefineHexInfo = () => {
        HexSize = (70 * pageInfo.scale)/M.f0;
        if (pageInfo.type === "hex") {
            HexInfo = {
                size: HexSize,
                pixelStart: {
                    x: 35 * pageInfo.scale,
                    y: HexSize,
                },
                width: 70  * pageInfo.scale,
                height: pageInfo.scale*HexSize,
                xSpacing: 70 * pageInfo.scale,
                ySpacing: 3/2 * HexSize,
                directions: {
                    "Northeast": new Cube(1,-1,0),
                    "East": new Cube(1,0,-1),
                    "Southeast": new Cube(0,1,-1),
                    "Southwest": new Cube(-1,1,0),
                    "West": new Cube(-1,0,1),
                    "Northwest": new Cube(0,-1,1),
                },
                halfToggleX: 35 * pageInfo.scale,
                halfToggleY: 0,
            }
            DIRECTIONS = ["Northeast","East","Southeast","Southwest","West","Northwest"];
        } else if (pageInfo.type === "hexr") {
            //Hex H or Flat Topped
            HexInfo = {
                size: HexSize,
                pixelStart: {
                    x: HexSize,
                    y: 35 * pageInfo.scale,
                },
                width: pageInfo.scale*HexSize,
                height: 70  * pageInfo.scale,
                xSpacing: 3/2 * HexSize,
                ySpacing: 70 * pageInfo.scale,
                directions: {
                    "North": new Cube(0, -1, 1),
                    "Northeast": new Cube(1, -1, 0),
                    "Southeast": new Cube(1,0,-1),
                    "South": new Cube(0,1,-1),
                    "Southwest": new Cube(-1,1,0),
                    "Northwest": new Cube(-1,0,1),
                },
                halfToggleX: 0,
                halfToggleY: 35 * pageInfo.scale,
            }
            DIRECTIONS = ["North","Northeast","Southeast","South","Southwest","Northwest"];
        }
    }


    const SM = {
        redflag: "status_Red_Flag::5610550",

    }; 

    let outputCard = {title: "",subtitle: "",faction: "",body: [],buttons: [],};

    const Factions = {
        "Neutral": {
            "image": "",
            "dice": "Neutral",
            "backgroundColour": "#FFFFFF",
            "titlefont": "Arial",
            "fontColour": "#0000ff",
            "borderColour": "#0000ff",
            "borderStyle": "5px ridge",
        },
        "Steel Legion": {
            "image": "https://files.d20.io/images/507708546/a0F5xh9Owh6LEjEGiGmeCA/thumb.png?1794882489",
            "dice": "IG",
            "backgroundColour": "#ffffff",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#000000",
            "borderStyle": "5px groove",
            "strategy": 2,

        },
        "Collegia Titanica": {
            "image": "https://files.d20.io/images/507708819/hms3sPkiv0gTPDdmge7UaA/thumb.png?1794882695",
            "dice": "Loyalist",
            "backgroundColour": "#ffffff",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#BDB76B",
            "borderStyle": "5px groove",
            "strategy": 3,

        },
        "Blood Pact": {
            "image": "https://files.d20.io/images/507708996/EoMDSLLUFPULZ_dp--6xCg/thumb.png?1794882888",
            "dice": "Traitor",
            "backgroundColour": "#8b0000",
            "titlefont": "Arial",
            "fontColour": "#000000",
            "borderColour": "#000000",
            "borderStyle": "5px groove",
            "strategy": 1,

        },







    };


    //hill los will be based on rays
    //others as hex
    const AreaTerrain = {
        "#000000": {name: "Hill 1", level: 1},
        "#434343": {name: "Hill 2", level: 2},
        "#666666": {name: "Hill 3", level: 3},
        "#ff9900": {
            name: "Crops",
            terrainHeight: 0, 
            cover: {"Infantry": 6, "Vehicles": false}, 
            move: {"Infantry": "Normal", "Vehicle": "Normal", "War Engine": "Normal"},
            los: "Obscures",         
        },



    }


    //hex los: Clear, Crops, Woods (2 hexes), Solid (Buildings etc)
    const HexTerrain = {
        "Woods": {
            name: "Woods",
            terrainHeight: 2, 
            cover: {"Infantry": 5, "Vehicle": false}, 
            move: {"Infantry": "Normal", "Vehicle": "Dangerous", "War Engine": "Dangerous"},
            los: "Solid",         
        },
        "Building 1": {
            name: "Building 1",
            terrainHeight: 1, 
            cover: {"Infantry": 4, "Vehicles": false}, 
            move: {"Infantry": "Normal", "Vehicle": "Impassable", "War Engine": "Impassable"},
            los: "Solid",         
        },





    }








    //line line collision where line1 is pt1 and 2, line2 is pt 3 and 4
    const lineLine = (pt1,pt2,pt3,pt4) => {
        //calculate the direction of the lines
        uA = ( ((pt4.x-pt3.x)*(pt1.y-pt3.y)) - ((pt4.y-pt3.y)*(pt1.x-pt3.x)) ) / ( ((pt4.y-pt3.y)*(pt2.x-pt1.x)) - ((pt4.x-pt3.x)*(pt2.y-pt1.y)) );
        uB = ( ((pt2.x-pt1.x)*(pt1.y-pt3.y)) - ((pt2.y-pt1.y)*(pt1.x-pt3.x)) ) / ( ((pt4.y-pt3.y)*(pt2.x-pt1.x)) - ((pt4.x-pt3.x)*(pt2.y-pt1.y)) );
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            intersection = {
                x: (pt1.x + (uA * (pt2.x-pt1.x))),
                y: (pt1.y + (uA * (pt2.y-pt1.y)))
            }
            return intersection;
        }
        return;
    }
   
 
  







    //Classes
    class Point {
        constructor(x,y) {
            this.x = x;
            this.y = y;
        };
        toOffset() {
            let cube = this.toCube();
            let offset = cube.toOffset();
            return offset;
        };
        toCube() {
            let x = this.x - HexInfo.pixelStart.x;
            let y = this.y - HexInfo.pixelStart.y;
            let q,r;
            if (pageInfo.type === "hex") {
                q = (M.b0 * x + M.b1 * y) / HexInfo.size;
                r = (M.b3 * y) / HexInfo.size;
            } else if (pageInfo.type === "hexr") {
                q = (M.b3 * x) / HexInfo.size;
                r = (M.b1 * x + M.b0 * y) / HexInfo.size;
            }
            let cube = new Cube(q,r,-q-r).round();
            return cube;
        };
        distance(b) {
            return Math.sqrt(((this.x - b.x) * (this.x - b.x)) + ((this.y - b.y) * (this.y - b.y)));
        }
        label() {
            return this.toCube().label();
        }
    }

    class Offset {
        constructor(col,row) {
            this.col = col;
            this.row = row;
        }
        label() {
            let label = rowLabels[this.row] + (this.col + 1).toString();
            return label;
        }
        toCube() {
            let q,r;
            if (pageInfo.type === "hex") {
                q = this.col - (this.row - (this.row&1))/2;
                r = this.row;
            } else if (pageInfo.type === "hexr") {
                q = this.col;
                r = this.row - (this.col - (this.col&1))/2;
            }
            let cube = new Cube(q,r,-q-r);
            cube = cube.round(); 
            return cube;
        }
        toPoint() {
            let cube = this.toCube();
            let point = cube.toPoint();
            return point;
        }
    };

    class Cube {
        constructor(q,r,s) {
            this.q = q;
            this.r =r;
            this.s = s;
        }

        add(b) {
            return new Cube(this.q + b.q, this.r + b.r, this.s + b.s);
        }
        angle(b) {
            //angle between 2 hexes
            let origin = this.toPoint();
            let destifaction = b.toPoint();

            let x = Math.round(origin.x - destifaction.x);
            let y = Math.round(origin.y - destifaction.y);
            let phi = Math.atan2(y,x);
            phi = phi * (180/Math.PI);
            phi = Math.round(phi);
            phi -= 90;
            phi = Angle(phi);
            return phi;
        }        
        subtract(b) {
            return new Cube(this.q - b.q, this.r - b.r, this.s - b.s);
        }
        static direction(direction) {
            return HexInfo.directions[direction];
        }
        neighbour(direction) {
            //returns a hex (with q,r,s) for neighbour, specify direction eg. hex.neighbour("NE")
            return this.add(HexInfo.directions[direction]);
        }
        neighbours() {
            //all 6 neighbours
            let results = [];
            for (let i=0;i<DIRECTIONS.length;i++) {
                results.push(this.neighbour(DIRECTIONS[i]));
            }
            return results;
        }

        len() {
            return (Math.abs(this.q) + Math.abs(this.r) + Math.abs(this.s)) / 2;
        }
        distance(b) {
            return this.subtract(b).len();
        }
        lerp(b, t) {
            return new Cube(this.q * (1.0 - t) + b.q * t, this.r * (1.0 - t) + b.r * t, this.s * (1.0 - t) + b.s * t);
        }
        linedraw(b) {
            //returns array of hexes between this hex and hex 'b' excl. hex 'b'
            var N = this.distance(b);
            var a_nudge = new Cube(this.q + 1e-06, this.r + 1e-06, this.s - 2e-06);
            var b_nudge = new Cube(b.q + 1e-06, b.r + 1e-06, b.s - 2e-06);
            var results = [];
            var step = 1.0 / Math.max(N, 1);
            for (var i = 1; i < N; i++) {
                results.push(a_nudge.lerp(b_nudge, step * i).round());
            }
            return results;
        }

        linedraw2(b) {
            //returns array of hexes between this hex and hex 'b' incl. hex 'b', nudging other way from above 
            var N = this.distance(b);
            var a_nudge = new Cube(this.q - 1e-06, this.r - 1e-06, this.s + 2e-06);
            var b_nudge = new Cube(b.q - 1e-06, b.r - 1e-06, b.s + 2e-06);
            var results = [];
            var step = 1.0 / Math.max(N, 1);
            for (var i = 1; i < N; i++) {
                results.push(a_nudge.lerp(b_nudge, step * i).round());
            }
            return results;
        }
        label() {
            let offset = this.toOffset();
            let label = offset.label();
            return label;
        }
        radius(rad) {
            //returns array of hexes in radius rad
            //Not only is x + y + z = 0, but the absolute values of x, y and z are equal to twice the radius of the ring
            let results = [];
            let h;
            for (let i = 0;i <= rad; i++) {
                for (let j=-i;j<=i;j++) {
                    for (let k=-i;k<=i;k++) {
                        for (let l=-i;l<=i;l++) {
                            if((Math.abs(j) + Math.abs(k) + Math.abs(l) === i*2) && (j + k + l === 0)) {
                                h = new Cube(j,k,l);
                                results.push(this.add(h));
                            }
                        }
                    }
                }
            }
            return results;
        }

        ring(radius) {
            let results = [];
            let b = new Cube(-1 * radius,0,1 * radius);  //start at west 
            let cube = this.add(b);
            for (let i=0;i<6;i++) {
                //for each direction
                for (let j=0;j<radius;j++) {
                    results.push(cube);
                    cube = cube.neighbour(DIRECTIONS[i]);
                }
            }
            return results;
        }

        round() {
            var qi = Math.round(this.q);
            var ri = Math.round(this.r);
            var si = Math.round(this.s);
            var q_diff = Math.abs(qi - this.q);
            var r_diff = Math.abs(ri - this.r);
            var s_diff = Math.abs(si - this.s);
            if (q_diff > r_diff && q_diff > s_diff) {
                qi = -ri - si;
            }
            else if (r_diff > s_diff) {
                ri = -qi - si;
            }
            else {
                si = -qi - ri;
            }
            return new Cube(qi, ri, si);
        }
        toPoint() {
            let x,y;
            if (pageInfo.type === "hex") {
                x = (M.f0 * this.q + M.f1 * this.r) * HexInfo.size;
                y = 3/2 * this.r * HexInfo.size;
            } else if (pageInfo.type === "hexr") {
                x = 3/2 * this.q * HexInfo.size;
                y = (M.f1 * this.q + M.f0 * this.r) * HexInfo.size;
            }
            x += HexInfo.pixelStart.x;
            y += HexInfo.pixelStart.y;
            let point = new Point(x,y);
            return point;
        }
        toOffset() {
            let col,row;
            if (pageInfo.type === "hex") {
                col = this.q + (this.r - (this.r&1))/2;
                row = this.r;
            } else if (pageInfo.type === "hexr") {
                col = this.q;
                row = this.r + (this.q - (this.q&1))/2;
            }
            let offset = new Offset(col,row);
            return offset;
        }
        whatDirection(b) {
            let delta = new Cube(b.q - this.q,b.r - this.r, b.s - this.s);
            let dir = "Unknown";
            let keys = Object.keys(HexInfo.directions);
            for (let i=0;i<6;i++) {
                let d = HexInfo.directions[keys[i]];
                if (d.q === delta.q && d.r === delta.r && d.s === delta.s) {
                    dir = keys[i];
                }
            }
            return dir
        }

     
    };

    class Hex {
        constructor(point) {
            this.centre = point;
            let offset = point.toOffset();
            this.offset = offset;
            this.tokenIDs = [];
            this.cube = offset.toCube();
            this.label = offset.label();
            let edges = {};
            for (let i=0;i<6;i++) {
                edges[DIRECTIONS[i]] = "Open";
            }
            this.edges = edges;
            this.terrain = ["Clear"];
            this.level = 0; //ground level
            this.height = 0; //height of terrain itself

            this.offboard = true;
            this.los = "Normal";
            this.cover = {"Infantry": false, "Vehicle": false},
            this.move = {"Infantry": "Normal", "Vehicle": "Normal", "War Engine": "Normal"},

            HexMap[this.label] = this;
        }


        Distance(b) {
            let dist = this.cube.distance(b.cube);
            return dist;
        }

        


    }






    class Unit {
        constructor(id) {
            let token = getObj("graphic",id);
            if (!token) {return};
            let charID = token.get("represents");
            let char = getObj("character", charID); 
            if (!char) {return};
            let location = new Point(token.get("left"),token.get("top"));
            let hexLabel = location.label();
            let attributes = AttributeArray(char.id);  

            this.faction = attributes.faction || "Neutral";
            this.player = Player(this.faction);

            this.type = attributes.type;

        
            this.speed = parseInt(attributes.speed);
            this.armour = parseInt(attributes.armour) || 7;
            this.cc = parseInt(attributes.cc) || 7;
            this.ff = parseInt(attributes.ff) || 7;
            this.init = parseInt(attributes.initiative);
            let s0 = attributes.special0 || "Nil";
            let s1 = attributes.special1 || "";
            let s2 = attributes.special2 || "";

            s0 = s0.split(',').map(e => e.trim());
            s1 = s1.split(",").map(e => e.trim());
            s2 = s2.split(",").map(e => e.trim());
            this.special = [].concat(s0,s1,s2);
            this.critical = attributes.criticalhit;

            let dc = Element(this.special,"Damage Capacity") || "1";
            this.dc = parseInt(dc.replace(/[^\d]/g,""));

            let shields = Element(this.special,"Void Shields") || "0";
            this.shields = parseInt(shields.replace(/[^\d]/g,""));
            

            this.height = (this.special.includes("Towering")) ? 1:0;

            let weapons = [];
            let maxRange = 0;
            for (let i=1;i<6;i++) {
                let equip = attributes["weapon" + i + "equipped"] || "Off";
                let wname = attributes["weapon" + i + "name"];
                if (equip === "Off") {continue};
                if (wname) {
                    wname = wname.trim();
                }
                if (!wname || wname === "") {
                    wname = attributes["weapon" + (i-1) + "name"];
                }
                let wnum = wname.match(/\d+x/i) || ["1"]; //get out 2x or 3x
                wnum = wnum[0];
                wname = wname.replace(wnum,"").trim();
                wnum = parseInt(wnum);

                let wrange = attributes["weapon" + i + "range"]; //a # or FF or CC

                if (isNaN(wrange) === false) {
                    maxRange = Math.max(maxRange,parseInt(wrange));
                }


                let wfp = attributes["weapon" + i + "fp"];
                let wtraits = attributes["weapon" + i + "traits"] || " ";
                let wfx = attributes["weapon" + i + "fx"] || " ";
                let wsound = attributes["weapon" + i + "sound"] || " ";
                
                let weapon = {
                    name: wname,
                    number: wnum,
                    range: wrange,
                    fp: wfp,
                    traits: wtraits,
                    fx: wfx,
                    sound: wsound,
                }

                weapons.push(weapon);
            }

            this.weapons = weapons;
            this.maxRange = maxRange;

            this.name = token.get("name");
            this.id = id;
            this.charName = attributes.displayname;
            this.charID = charID;
            this.token = token;

            this.hexLabel = hexLabel; //current location
            
            let formationID = "";
            if (state.EA.unitInfo[id]) {
                formationID = state.EA.unitInfo[id];
            }
            this.formationID = formationID;

            //let transportID = Object.keys(state.EA.passengerID).find(key => state.EA.passengerID[key] === id);


            this.targetIDArray = [];



            Units[id] = this;

            log(this)



        }


        Distance(b) {
            let distance = HexMap[this.hexLabel].Distance(HexMap[b.hexLabel]);
            if (this.type === "War Engine" || b.type === "War Engine") {
                distance -= 1;
            }
            return distance;
        }

        MakeLeader() {
            let formation = Formations[this.formationID];
            let aura = formation.action === "" ? "#00ff00":(formation.action === "Overwatch") ? "#ff00ff":"#000000";
            this.token.set({
                aura1_color: aura,
                aura1_opacity: 1,
                aura1_radius: 0.1,
                bar3_value: formation.blastMarkers,
                bar3_max: formation.health,
                showplayers_bar3: true,
            })
            formation.leaderID = this.id;
        }

        Destroy() {
            this.token.set("status_dead",true);
            this.token.set("layer","map");
            Formations[this.formationID].RemoveUnit(this.id);
            delete Units[this.id];
        }


        Broken() {
            let broken = this.token.get("tint_color") === "#ff0000" ? true:false;
            return broken;
        }

        Break() {
            this.token.set("tint_color","#ff0000");            
        }

        AddBM(markers) {
            let bm = parseInt(this.token.get("bar3_value"));
            let max = parseInt(this.token.get("bar3_max"));
            bm += markers;
            if (bm >= max) {
                Formations[this.formationID].Break();
            } else {
                this.token.set("bar3_value",bm);
            }
        }



    }

    class Formation {
        constructor(id,player = 2) {
            this.id = id;
            this.player = player;
            this.unitIDs = [];
            this.leaderID = "";
            this.health = 0;
            this.startingHealth = 0;
            this.blastMarkers = 0;
            this.farsight = false;
            this.action = "";
            Formations[id] = this;

            log(this)
        }
        AddUnit(id,leader = false) {
            if (this.unitIDs.includes(id) === false) {
                if (leader === false) {
                    this.unitIDs.push(id);
                } else {
                    this.unitIDs.unshift(id);
                    this.leaderID = id;
                }
                this.health += Units[id].dc;
            }
        }
        RemoveUnit(id) {
            let index = this.unitIDs.indexOf(id);
            if (index > -1) {
                let unit = Units[id];
                this.unitIDs.splice(index,1);
                let dc = parseInt(unit.token.get("bar1_value")) || 1;
                this.health -= dc;  
                if (unit.special.includes("Farsight")) {
                    let fs = false;
                    for (let k=0;k<this.unitIDs.length;k++) {
                        if (Units[this.unitIDs[k]].special.includes("Farsight")) {
                            fs = true;
                            break;
                        }
                    }
                    this.farsight = fs;
                }
            }
            if (this.leaderID === id && this.unitIDs.length > 0) {
                this.leaderID = this.unitIDs[0];
                Units[this.unitIDs[0]].MakeLeader();
            }
            if (this.unitIDs.length === 0) {
                delete Formations(this.id);
                outputCard.body.push("Formation Destroyed!");
            }
        }


        Coherency() {
            if (this.unitIDs.length === 1) {
                return true;
            }
            let group = [this.leaderID];
            cLoop1:
            for (let i=0;i<this.unitIDs.length;i++) {
                let id = this.unitIDs[i];
                if (group.includes(id)) {continue}
                let unit1 = Units[id];
                for (let j=0;j<group.length;j++) {
                    let unit2 = Units[group[j]];
                    let dist = unit1.Distance(unit2);
                    if (dist <= 3) {
                        group.push(id);
                        continue cLoop1;
                    }
                }
                //not in coherency
                return false;
            }
            return true;
        }

        Break() {
            _.each(this.unitIDs, unitID => {
                let unit = Units[unitID];
                if (unit) {
                    unit.Break();
                } else {
                    this.RemoveUnit(unitID);
                }
            })
            Units[this.leaderID].token.set("bar3_value",0);
        }

        SetOverwatch(over) {
            let leaderUnit = Units[this.leaderID];
            let aura = (over === true) ? "#ff00ff":"#000000";
            leaderUnit.token.set("aura1_color",aura);
        }









    }














    const DefineMap = () => {
        let tokens = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map"});
        let map = tokens.find(e => e.get("name") === "Map");
        let cX = map.get("left");
        let cY = map.get("top");
        let x0 = cX - map.get("width")/2;
        let x1 = cX + map.get("width")/2;
        let y0 = cY - map.get("height")/2;
        let y1 = cY + map.get("height")/2;

        _.each(HexMap,hex => {
             if (hex.centre.x >= x0 && hex.centre.x <= x1 && hex.centre.y >= y0 && hex.centre.y <= y1) {hex.offboard = false};
        })
    }


    const edgeCrossed = (unit) => {
        let hex = HexMap[unit.hexLabel];
        let prevHex = HexMap[unit.lastHexLabel];
        let direction = prevHex.cube(hex.cube);
        let edge = lastHex.edges[direction];
        return edge;
    }

    const simpleObj = (o) => {
        let p = JSON.parse(JSON.stringify(o));
        return p;
    };

    const getCleanImgSrc = (imgsrc) => {
        let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    };

    const tokenImage = (img) => {
        //modifies imgsrc to fit api's requirement for token
        img = getCleanImgSrc(img);
        img = img.replace("%3A", ":");
        img = img.replace("%3F", "?");
        img = img.replace("med", "thumb");
        return img;
    };

    const stringGen = () => {
        let text = "";
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for (let i = 0; i < 6; i++) {
            text += possible.charAt(randomInteger(possible.length - 1));
        }
        return text;
    };

    const findCommonElements = (arr1,arr2) => {
        //iterates through array 1 and sees if array 2 has any of its elements
        //returns true if the arrays share an element
        return arr1.some(item => arr2.includes(item));
    };


    const DeepCopy = (variable) => {
        variable = JSON.parse(JSON.stringify(variable))
        return variable;
    };

    const PlaySound = (name) => {
        let sound = findObjs({type: "jukeboxtrack", title: name})[0];
        if (sound) {
            sound.set({playing: true,softstop:false});
        }
    };


    //Retrieve Values from character Sheet Attributes
    const Attribute = (character,attributename) => {
        //Retrieve Values from character Sheet Attributes
        let attributeobj = findObjs({type:'attribute',characterid: character.id, name: attributename})[0]
        let attributevalue = "";
        if (attributeobj) {
            attributevalue = attributeobj.get('current');
        }
        return attributevalue;
    };

    const AttributeArray = (characterID) => {
        let aa = {}
        let attributes = findObjs({_type:'attribute',_characterid: characterID});
        for (let j=0;j<attributes.length;j++) {
            let name = attributes[j].get("name")
            let current = attributes[j].get("current")   
            if (!current || current === "") {current = " "} 
            aa[name] = current;
            let max = attributes[j].get("max")   
            if (!max || max === "") {max = " "} 
            aa[name + "_max"] = max;
        }
        return aa;
    };

    const AttributeSet = (characterID,attributename,newvalue,max) => {
        if (!max) {max = false};
        let attributeobj = findObjs({type:'attribute',characterid: characterID, name: attributename})[0]
        if (attributeobj) {
            if (max === true) {
                attributeobj.set("max",newvalue)
            } else {
                attributeobj.set("current",newvalue)
            }
        } else {
            if (max === true) {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    max: newvalue,
                    characterid: characterID,
                });            
            } else {
                createObj("attribute", {
                    name: attributename,
                    current: newvalue,
                    characterid: characterID,
                });            
            }
        }
    };

    const DeleteAttribute = (characterID,attributeName) => {
        let attributeObj = findObjs({type:'attribute',characterid: characterID, name: attributeName})[0]
        if (attributeObj) {
            attributeObj.remove();
        }
    }




    const ButtonInfo = (phrase,action,inline) => {
        //inline - has to be true in any buttons to have them in same line -  starting one to ending one
        if (!inline) {inline = false};
        let info = {
            phrase: phrase,
            action: action,
            inline: inline,
        }
        outputCard.buttons.push(info);
    };

    const SetupCard = (title,subtitle,faction) => {
        outputCard.title = title;
        outputCard.subtitle = subtitle;
        outputCard.faction = faction;
        outputCard.body = [];
        outputCard.buttons = [];
        outputCard.inline = [];
    };

    const DisplayDice = (roll,tablename,size) => {
        roll = roll.toString();
        let table = findObjs({type:'rollabletable', name: tablename})[0];
        if (!table) {
            table = findObjs({type:'rollabletable', name: "Neutral"})[0];
        }
        let obj = findObjs({type:'tableitem', _rollabletableid: table.id, name: roll })[0];        
        let avatar = obj.get('avatar');
        let out = "<img width = "+ size + " height = " + size + " src=" + avatar + "></img>";
        return out;
    };

    const Angle = (theta) => {
        while (theta < 0) {
            theta += 360;
        }
        while (theta >= 360) {
            theta -= 360;
        }
        return theta
    }   





    const RotatePoint = (cX,cY,angle, p) => {
        //cx, cy = coordinates of the centre of rotation
        //angle = clockwise rotation angle
        //p = point object
        let s = Math.sin(angle);
        let c = Math.cos(angle);
        // translate point back to origin:
        p.x -= cX;
        p.y -= cY;
        // rotate point
        let newX = p.x * c - p.y * s;
        let newY = p.x * s + p.y * c;
        // translate point back:
        p.x = Math.round(newX + cX);
        p.y = Math.round(newY + cY);
        return p;
    }


    const PrintCard = (id) => {
        let output = "";
        if (id) {
            let playerObj = findObjs({type: 'player',id: id})[0];
            let who = playerObj.get("displayname");
            output += `/w "${who}"`;
        } else {
            output += "/desc ";
        }

        if (!outputCard.faction || !Factions[outputCard.faction]) {
            outputCard.faction = "Neutral";
        }

        //start of card
        output += `<div style="display: table; border: ` + Factions[outputCard.faction].borderStyle + " " + Factions[outputCard.faction].borderColour + `; `;
        output += `background-color: #EEEEEE; width: 100%; text-align: center; `;
        output += `border-radius: 1px; border-collapse: separate; box-shadow: 5px 3px 3px 0px #aaa;;`;
        output += `"><div style="display: table-header-group; `;
        output += `background-color: ` + Factions[outputCard.faction].backgroundColour + `; `;
        output += `background-image: url(` + Factions[outputCard.faction].image + `), url(` + Factions[outputCard.faction].image + `); `;
        output += `background-position: left,right; background-repeat: no-repeat, no-repeat; background-size: contain, contain; align: center,center; `;
        output += `border-bottom: 2px solid #444444; "><div style="display: table-row;"><div style="display: table-cell; padding: 2px 2px; text-align: center;"><span style="`;
        output += `font-family: ` + Factions[outputCard.faction].titlefont + `; `;
        output += `font-style: normal; `;

        let titlefontsize = "1.4em";
        if (outputCard.title.length > 12) {
            titlefontsize = "1em";
        }

        

        output += `font-size: ` + titlefontsize + `; `;
        output += `line-height: 1.2em; font-weight: strong; `;
        output += `color: ` + Factions[outputCard.faction].fontColour + `; `;
        output += `text-shadow: none; `;
        output += `">`+ outputCard.title + `</span><br /><span style="`;
        output += `font-family: Arial; font-variant: normal; font-size: 13px; font-style: normal; font-weight: bold; `;
        output += `color: ` +  Factions[outputCard.faction].fontColour + `; `;
        output += `">` + outputCard.subtitle + `</span></div></div></div>`;

        //body of card
        output += `<div style="display: table-row-group; ">`;

        let inline = 0;

        for (let i=0;i<outputCard.body.length;i++) {
            let out = "";
            let line = outputCard.body[i];
            if (!line || line === "") {continue};
            if (line.includes("[INLINE")) {
                let end = line.indexOf("]");
                let substring = line.substring(0,end+1);
                let num = substring.replace(/[^\d]/g,"");
                if (!num) {num = 1};
                line = line.replace(substring,"");
                out += `<div style="display: table-row; background: #FFFFFF;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color: #000000; `;
                out += `"> <div style='text-align: center; display:block;'>`;
                out += line + " ";

                for (let q=0;q<num;q++) {
                    let info = outputCard.inline[inline];
                    out += `<a style ="background-color: ` + Factions[outputCard.faction].backgroundColour + `; padding: 5px;`
                    out += `color: ` + Factions[outputCard.faction].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
                    out += `border-color: ` + Factions[outputCard.faction].borderColour + `; font-family: Tahoma; font-size: x-small; `;
                    out += `"href = "` + info.action + `">` + info.phrase + `</a>`;
                    inline++;                    
                }
                out += `</div></span></div></div>`;
            } else {
                line = line.replace(/\[hr(.*?)\]/gi, '<hr style="width:95%; align:center; margin:0px 0px 5px 5px; border-top:2px solid $1;">');
                line = line.replace(/\[\#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6})\](.*?)\[\/[\#]\]/g, "<span style='color: #$1;'>$2</span>"); // [#xxx] or [#xxxx]...[/#] for color codes. xxx is a 3-digit hex code
                line = line.replace(/\[[Uu]\](.*?)\[\/[Uu]\]/g, "<u>$1</u>"); // [U]...[/u] for underline
                line = line.replace(/\[[Bb]\](.*?)\[\/[Bb]\]/g, "<b>$1</b>"); // [B]...[/B] for bolding
                line = line.replace(/\[[Ii]\](.*?)\[\/[Ii]\]/g, "<i>$1</i>"); // [I]...[/I] for italics
                let lineBack,fontcolour;
                if (line.includes("[F]")) {
                    let ind1 = line.indexOf("[F]") + 3;
                    let ind2 = line.indexOf("[/f]");
                    let fac = line.substring(ind1,ind2);
                    if (Factions[fac]) {
                        lineBack = Factions[fac].backgroundColour;
                        fontcolour = Factions[fac].fontColour;
                    }
                    line = line.replace("[F]" + fac + "[/f]","");

                } else {
                    lineBack = (i % 2 === 0) ? "#D3D3D3": "#EEEEEE";
                    fontcolour = "#000000";
                }
                out += `<div style="display: table-row; background: ` + lineBack + `;; `;
                out += `"><div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                out += `"><span style="line-height: normal; color:` + fontcolour + `; `;
                out += `"> <div style='text-align: center; display:block;'>`;
                out += line + `</div></span></div></div>`;                
            }
            output += out;
        }

        //buttons
        if (outputCard.buttons.length > 0) {
            for (let i=0;i<outputCard.buttons.length;i++) {
                let info = outputCard.buttons[i];
                let inline = info.inline;
                if (i>0 && inline === false) {
                    output += '<hr style="width:95%; align:center; margin:0px 0px 5px 5px; border-top:2px solid $1;">';
                }
                let out = "";
                let borderColour = Factions[outputCard.faction].borderColour;
                
                if (inline === false || i===0) {
                    out += `<div style="display: table-row; background: #FFFFFF;; ">`;
                    out += `<div style="display: table-cell; padding: 0px 0px; font-family: Arial; font-style: normal; font-weight: normal; font-size: 14px; `;
                    out += `"><span style="line-height: normal; color: #000000; `;
                    out += `"> <div style='text-align: center; display:block;'>`;
                }
                if (inline === true) {
                    out += '<span>     </span>';
                }
                out += `<a style ="background-color: ` + Factions[outputCard.faction].backgroundColour + `; padding: 5px;`
                out += `color: ` + Factions[outputCard.faction].fontColour + `; text-align: center; vertical-align: middle; border-radius: 5px;`;
                out += `border-color: ` + borderColour + `; font-family: Tahoma; font-size: x-small; `;
                out += `"href = "` + info.action + `">` + info.phrase + `</a>`
                
                if (inline === false || i === (outputCard.buttons.length - 1)) {
                    out += `</div></span></div></div>`;
                }
                output += out;
            }

        }

        output += `</div></div><br />`;
        sendChat("",output);
        outputCard = {title: "",subtitle: "",faction: "",body: [],buttons: [],};
    }

    //related to building hex map
    const LoadPage = () => {
        //build Page Info and flesh out Hex Info
        pageInfo.page = getObj('page', Campaign().get("playerpageid"));
        pageInfo.name = pageInfo.page.get("name");
        pageInfo.scale = pageInfo.page.get("snapping_increment");
        pageInfo.width = pageInfo.page.get("width") * 70;
        pageInfo.height = pageInfo.page.get("height") * 70;
        pageInfo.type = pageInfo.page.get("grid_type");

    }

    const BuildMap = () => {
        let startTime = Date.now();
        HexMap = {};

        let startX = HexInfo.pixelStart.x;
        let startY = HexInfo.pixelStart.y;
        let halfToggleX = HexInfo.halfToggleX;
        let halfToggleY = HexInfo.halfToggleY;
        if (pageInfo.type === "hex") {
            for (let j = startY; j <= pageInfo.height;j+=HexInfo.ySpacing){
                for (let i = startX;i<= pageInfo.width;i+=HexInfo.xSpacing) {
                    let point = new Point(i,j);     
                    let hex = new Hex(point);
                }
                startX += halfToggleX;
                halfToggleX = -halfToggleX;
            }
        } else if (pageInfo.type === "hexr") {
            for (let i=startX;i<=pageInfo.width;i+=HexInfo.xSpacing) {
                for (let j=startY;j<=pageInfo.height;j+=HexInfo.ySpacing) {
                    let point = new Point(i,j);     
                    let hex = new Hex(point);
                }
                startY += halfToggleY;
                halfToggleY = -halfToggleY;
            }
        }


        AddAreaTerrain();
        AddHexTerrain();
        AddTokens();        
        DefineMap();
        
        let elapsed = Date.now()-startTime;
        log("Hex Map Built in " + elapsed/1000 + " seconds");
    };


    const AddAreaTerrain = () => {
        let paths = findObjs({_pageid: Campaign().get("playerpageid"),_type: "pathv2",layer: "map",});
        _.each(paths,path => {
            let area = AreaTerrain[path.get("stroke").toLowerCase()];
            if (area) {
                let vertices = translatePoly(path);
                _.each(HexMap,hex => {
                    let test = pointInPolygon(hex.centre,vertices);
                    if (test) {
                        if (area.name.includes("Hill")) {
                            hex.level = area.level;
                            hex.terrain.push(area.name);
                        } else {
                            let index = hex.terrain.indexOf("Clear");
                            if (index > -1) {
                                hex.terrain[index] = area.name;
                            }
                            hex.height = area.terrainHeight;
                            hex.cover = area.cover;
                            hex.move = area.move;
                            hex.los = area.los;
                        }
                    }
                })
            }
        })


    }

    const AddHexTerrain = () => {
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "map",
        });
        _.each(tokens, token => {
            let terrain = HexTerrain[token.get("name")];
            if (terrain) {
                let c = new Point(token.get("left"), token.get("top"));
                let label = c.label();
                let hex = HexMap[label];
                let index = hex.terrain.indexOf("Clear");
                if (index > -1) {
                    hex.terrain[index] = terrain.name;
                }
                hex.height = terrain.terrainHeight;
                hex.cover = terrain.cover;
                hex.move = terrain.move;
                hex.los = terrain.los;
            }




        })
    }


    const DrawLine = (pt1,pt2,colour = "#ff0000",type = "Deploy") => {
        let points = [[pt1.x,pt1.y],[pt2.x,pt2.y]];
        let x = (pt1.x + pt2.x)/2;
        let y = (pt1.y + pt2.y)/2;

        let layer = "foreground";
        if (type === "Deploy") {
            layer = "map";
        }

        let page = getObj('page',Campaign().get('playerpageid'));
        if(page) {
            let line = createObj('pathv2',{
                layer: layer,
                pageid: page.id,
                shape: "pol",
                stroke: colour,
                stroke_width: 7,
                x: x,
                y: y,
                points: JSON.stringify(points),
            });
            if (line) {
                toFront(line);
                if (type === "LOS") {
                    state.EA.losLines.push(line.get("id"))
                } else {
                    state.EA.deployLines.push(line.get("id"));
                }
            }
        }
    }





     
    const AddTokens = () => {
        //add tokens on token layer to arrays
        Units = {};
        //create an array of all tokens
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        });
   
        let s = 0;
        tokens.forEach((token) => {
            let formationID = state.EA.unitInfo[token.id];
            if (formationID) {
                let formation = Formations[formationID];
                if (!formation) {
                    let info = state.EA.formationInfo[formationID];
                    formation = new Formation(formationID);
                    formation.startingHealth = info.startingHealth;
                    formation.player = info.player;
                }
                let unit = new Unit(token.id);
                let leader = unit.token.get("bar3_max") > 0 ? true:false;
                formation.AddUnit(token.id,leader);
                if (leader === true) {
                    formation.blastMarkers = parseInt(unit.token.get("bar3_value")) || 0;
                }
                s++
            }
        });


        log(s + " Units added to Arrays");
    }





    const translatePoly = (poly) => {
        //translate points in a pathv2 polygon to map points
        let vertices = [];
        let points = JSON.parse(poly.get("points"));
        let centre = new Point(poly.get("x"), poly.get("y"));
        //covert path points from relative coords to actual map coords
        //define 'bounding box;
        let minX = Infinity,minY = Infinity, maxX = 0, maxY = 0;
        _.each(points,pt => {
            minX = Math.min(pt[0],minX);
            minY = Math.min(pt[1],minY);
            maxX = Math.max(pt[0],maxX);
            maxY = Math.max(pt[1],maxY);
        })
        //translate each point back based on centre of box
        let halfW = (maxX - minX)/2 + minX;
        let halfH = (maxY - minY)/2 + minY
        let zeroX = centre.x - halfW;
        let zeroY = centre.y - halfH;
        _.each(points,pt => {
            let x = Math.round(pt[0] + zeroX);
            let y = Math.round(pt[1] + zeroY);
            vertices.push(new Point(x,y));
        })
        return vertices;
    }



    const pointInPolygon = (point,vertices) => {
        //evaluate if point is in the polygon
        collision = false
        len = vertices.length - 1
        for (let c=0;c<len;c++) {
            vc = vertices[c];
            vn = vertices[c+1]
            if (((vc.y >= point.y && vn.y < point.y) || (vc.y < point.y && vn.y >= point.y)) && (point.x < (vn.x-vc.x)*(point.y-vc.y)/(vn.y-vc.y)+vc.x)) {
                collision = !collision
            }
        }
        return collision
    }


    const XHEX = (point) => {
        //makes a small group of points for checking around centre
        let points = [point];
        points.push(new Point(point.x - 20,point.y - 20));
        points.push(new Point(point.x + 20,point.y - 20));
        points.push(new Point(point.x + 20,point.y + 20));
        points.push(new Point(point.x - 20,point.y + 20));
        return points;
    }



    //game functions
    const ClearState = (msg) => {
        //clear arrays
        HexMap = {}; 
        Units = {};
        Formations = {};
        
        //clear token info
        let tokens = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            layer: "objects",
        })
    
        tokens.forEach((token) => {
            if (token.get("name").includes("Objective") === true) {return};

            token.set({
                name: "",
                tint_color: "transparent",
                aura1_color: "transparent",
                aura1_radius: 0,
                aura2_color: "transparent",
                aura2_radius: 0,
                showplayers_aura1: true,
                showplayers_aura2: true,
                showname: true,
                bar1_value: "",
                bar1_max: "",
                showplayers_bar1: false,
                bar2_value: "",
                bar2_max: "",
                showplayers_bar2: false, 
                bar3_value: "",
                bar3_max: "",
                showplayers_bar3: false, 
                gmnotes: "",
                statusmarkers: "",
                tooltip: "",
                rotation: 0,
            });                
        });
    
        state.EA = {
            turn: 0,
            playerIDs: ["",""], //playerID of player 0 or 1
            phase: "End",
            formationInfo: {}, //ref by formation ID, list of tokenIDs in formation
            unitInfo: {}, //ref by token ID, is the formationID of that token
            passengerID: {}, //ref by tokenID for the transport is the ID of the passenger
            attachedIDs: {}, //ref by tokenID of the main unit, is the IDs in an array of leaders, HQs attached to it
           
            factions: [[],[]],
            formations: [0,0],
            formationMarkers: [[],[]],
            strategy: [0,0],
            activations: [],
            losLines: [],
            deployLines: [],


        }
    

        CleanMap("All");
        BuildMap();

        sendChat("","Cleared State/Arrays");



    }

    const Player = (faction) => {
        let player = 2;
        if (state.EA.factions[0].includes(faction) || state.EA.factions[0].length === 0) {
            player = 0;
        } else if (state.EA.factions[1].includes(faction) || state.EA.factions[1].length === 0) {
            player = 1;
        } 
        return player;
    }

    const Element = (array,word) => {
        let element;
        for (let i=0;i<array.length;i++) {
            if (array[i].includes(word)) {
                element = array[i];
                break;
            }
        }
        return element;
    }



    const CleanMap = (type) => {
        let mapTokenArray = findObjs({_pageid: Campaign().get("playerpageid"),_type: "graphic",_subtype: "token",layer: "map",});
        //remove dead
        _.each(mapTokenArray,token => {
            let id = token.get("id");
            if (token.get("status_dead") === true) {
                token.remove();
            }
        });
        if (type) {
            if (type === "All") {
                list = []; //names of tokens to remove
            } else {
                list = [type];
            }
            _.each(mapTokenArray,token => {
                let id = token.get("id");
                if (list.includes(token.get("name"))) {
                    token.remove();
                }
            });
        }






    }





    const RollD6 = (msg) => {
        PlaySound("Dice");
        let roll = randomInteger(6);
        let playerID = msg.playerid;
        let player = 2;
        if (msg.selected) {
            let id = msg.selected[0]._id;
            if (id) {
                let unit = Units[id];
                if (unit) {
                    player = unit.player;
                    if (state.EA.playerIDs[player] === "") {
                        state.EA.playerIDs[player] = playerID;
                    }
                } else {
                    sendChat("","Click on one of your Units then select Roll again");
                    return;
                }
            }
        } else {
            player = state.EA.playerIDs.indexOf(playerID);
            if (player === -1) {
                sendChat("","Click on one of your Units then select Roll again");
                return;
            }
        }
        let faction = state.EA.factions[player][0] || "Neutral";
        if (strategyFlag[player] === true) {
            SetupCard("Strategy Roll","",faction);
            outputCard.body.push(DisplayDice(roll,Factions[faction].dice,40));
            let strat = Factions[faction].strategy;
            let result = roll + strat;
            outputCard.body.push("Strategy Rating: " + strat);
            outputCard.body.push("Result: " + result);
            PrintCard();
            strategyFlag[player] = false;
        } else {
            let res = "/direct " + DisplayDice(roll,Factions[faction].dice,40);
            sendChat("player|" + playerID,res);
        }
    }

    const NextPhase = () => {
        let turn = state.EA.turn;
        let phase = state.EA.phase;
        if (turn === 0) {
            //start of game things


        }
//maybe checks for things like rallies being done, all unbroken formations activated etc



        phase = (phase === "End") ? "Strategy":"End";
        if (phase === "Strategy") {
            state.EA.turn++;
        }
        state.EA.phase = phase;
        switch(phase) {
            case 'Strategy':
                StrategyPhase();
                break;
            case 'End':
                EndPhase();
                break;
        }
    }

    StrategyPhase = () => {
        SetupCard("Turn " + state.EA.turn,"Strategy Phase","Neutral");
        let higherStrat = state.EA.strategy[0] > state.EA.strategy[1] ? 0:1;
        if (state.EA.strategy[0] === state.EA.strategy[1]) {
            higherStrat = randomInteger(2) - 1;
        }
        let hsFaction = state.EA.factions[higherStrat][0];
        outputCard.body.push("Tunnellers then Teleporting Units are placed, alternating");
        outputCard.body.push("The " + hsFaction + " Player determines who places these first");
        outputCard.body.push("[hr]");
        outputCard.body.push("Both Players Then Roll a Dice");
        outputCard.body.push("Their Armies Strategy Rating will be added");
        outputCard.body.push("Highest Result Chooses who Activates first");
        outputCard.body.push("Ties go to the player who LOST the last Strategy Roll");
        outputCard.body.push("Or a Reroll if Turn 1");
        PrintCard();
        strategyFlag = [true,true];

        _.each(Formations,formation => {
            formation.action = "";
            Units[formation.leaderID].token.set("aura1_color","#00ff00");
        })
        state.EA.activations = [];

    }

    EndPhase = () => {
        SetupCard("Turn " + state.EA.turn,"End Phase","Neutral");
        outputCard.body.push("Aircraft Make Disengagement Moves");
//Resolve critical hit and other end of turn effects (alternate)
        outputCard.body.push("Rally any Broken Formations");
        outputCard.body.push("Remove any Daemons");
        outputCard.body.push("Check Victory Conditions");
        PrintCard();
    }


    const Activate = (msg) => {
        let Tag = msg.content.split(";");
        let unit = Units[Tag[1]];
        let formation = Formations[unit.formationID];
        let leaderUnit = Units[formation.leaderID];
        let action = Tag[2];

        let errorMsg = [];

        let retained = false;
        let doubleRetain = false;
        if (leaderUnit.player === state.EA.activations[state.EA.activations.length - 1]) {  
            retained = true;
            if (leaderUnit.player === state.EA.activations[state.EA.activations.length - 2]) {
                if (Craftworlds.includes(leaderUnit.faction)) {
                    _.each(Formations,formation => {
                        if (formation.player === leaderUnit.player && formation.farsight === true) {
                            doubleRetain = true;
                        }
                    })
                } 
                if (doubleRetain === false) {
                    errorMsg.push("Cannot Activate 3x in a row");
                }
            }
        } 

        if (leaderUnit.token.get("aura1_color") === "#000000") {
            errorMsg.push("Formation has activated this turn");
        }


        let initiative = leaderUnit.init;
        let blastMarkers = parseInt(leaderUnit.token.get("bar3_value"));

        let target = initiative;
        let tip = "Initiative: " + initiative + "+";
        if (blastMarkers > 0) {
            tip += "<br>Blast Markers -1";
            target++;
        }
        if ((retained === true && formation.farsight === false) || doubleRetain === true) {
            tip += "<br>Retained Initiative -1";
            target++;
        }

        let coherency = formation.Coherency();

        if ((action === "Sustained Fire" || action === "Overwatch") && coherency === false) {
            errorMsg.push("Formation not in Coherency, cannot take a " + action + " action");
        }

        if (leaderUnit.Broken()) {
            errorMsg.push("Formation is Broken and Cannot Activate");
        }


        SetupCard("Activate",action,leaderUnit.faction);
        if (errorMsg.length > 0) {
            _.each(errorMsg,msg => {
                outputCard.body.push(msg);
            })
            PrintCard();
            return;
        }

        let roll = randomInteger(6);

        tip = '[' + target + '](#" class="showtip" title="' + tip + ')';


        outputCard.body.push(DisplayDice(roll,Factions[leaderUnit.faction].dice,32) + " vs. " + tip + "+");

        if (roll >= target) {
            if (action === "Advance") {
                outputCard.body.push("The Formation may make one Move and then Shoot");
            }
            if (action === "Engage") {
                outputCard.body.push("The Formation may make a Charge Move then Fight an Assault");
            }
            if (action === "Double") {
                outputCard.body.push("The Formation may make two Moves and then Shoot with a -1 modifier");
            }
            if (action === "March") {
                outputCard.body.push("The Formation make make 3 Moves");
            }
            if (action === "Marshal") {
                outputCard.body.push("The Formation may either Shoot with a -1 Modifier then Regroup or Move then Regroup")
            }
            if (action === "Overwatch") {
                outputCard.body.push("The Formation may not Move and Enters Overwatch");
            }
            if (action === "Sustained Fire") {
                outputCard.body.push("The Formation may not turn or Move, but can Shoot with a +1 modifier");
            }
            if (coherency === false) {
                outputCard.body.push("As part of its move, the Formation must move into Coherency");
            }
        } else {
            outputCard.body.push("Failure. The Unit takes a Blast Marker");
            leaderUnit.AddBM(1);
            action = "Hold";
            if (leaderUnit.Broken()) {
                outputCard.body.push("The Formation Breaks");
                outputCard.body.push("It may make a Withdrawal Move");
            } else {
                outputCard.body.push("The Unit must take a Hold Action");
                if (coherency === false) {
                    outputCard.body.push("As it is out of Coherency it must make a single Move and get into Coherency");
                } else {
                    outputCard.body.push("The Unit may do one of Move, Fire or Regroup");
                }
            }
        }
        formation.action = action;

        if (action !== "Overwatch") {
            leaderUnit.token.set("aura1_color","#000000");
        } else {
            formation.SetOverwatch(true);
        }

        let remainingOpp = false;
        let remainingOwn = false;
        let oppPlayer = (leaderUnit.player === 0) ? 1:0;
        let oppFaction = state.EA.factions[oppPlayer][0];
        _.each(Formations,formation2 => {
            if (formation2.action === "" && Units[formation2.leaderID].Broken() === false) {
                if (formation2.player === formation.player) {
                    remainingOwn = true;
                } else {
                    remainingOpp = true;
                }
            }
        })

        if (remainingOwn === false && remainingOpp === true) {
            outputCard.body.push("[hr]");
            outputCard.body.push(leaderUnit.faction + " has no other Unbroken Formations to Activate");
            state.EA.activations = [];
        } else if (remainingOpp === true) {
            if (retained === false) {
                state.EA.activations = [leaderUnit.player];
            } else {
                state.EA.activations.push(leaderUnit.player);
            }
        } else if (remainingOwn === true) {
            outputCard.body.push("[hr]");
            outputCard.body.push(oppFaction + " has no other Unbroken Formations to Activate");
            state.EA.activations = [];
        } else {
            state.EA.activations = [];
            outputCard.body.push("[hr]");
            outputCard.body.push("Neither side has Unbroken Formations to Activate");
            outputCard.body.push("Select Next Phase when ready");
            state.EA.activations = [];
        }

        PrintCard();

    }









    const CheckLOS = (msg) => {
        let startTime = Date.now();

        let Tag = msg.content.split(";");
        let unit1 = Units[Tag[1]];
        let unit2 = Units[Tag[2]];
        if (!unit1 || !unit2) {
            sendChat("","Invalid Units")
            return;
        }
        let losResult = LOS(unit1,unit2);

        SetupCard("LOS","",unit1.faction);
        let d = losResult.distance * 150;
        outputCard.body.push("Range: " + losResult.distance);
        if (losResult.los === true) {
            outputCard.body.push("There is LOS to the Target");
            if (losResult.obscured === true) {
                outputCard.body.push("Obscured: -1 to hit");
            }
            if (losResult.cover !== false) {
                outputCard.body.push("Cover: " + losResult.cover + "+");
            }
        } else {
            outputCard.body.push("No LOS To Target");
            outputCard.body.push("Blocked at: " + losResult.losBlocked);
        }



        PrintCard();

        let elapsed = Date.now()-startTime;
        log("Check LOS " + elapsed/1000 + " seconds");
    }


    const GroupLOS = (msg) => {
        let startTime = Date.now();

        let Tag = msg.content.split(";");
        let unit1 = Units[Tag[1]];
        let unit2 = Units[Tag[2]];
        if (!unit1 || !unit2) {
            sendChat("","Invalid Units")
            return;
        }

        let info = FormationLOS(unit1,unit2);

        SetupCard("LOS Check","",unit1.faction);

        if (info.noLOS === true) {
            outputCard.body.push("No LOS To Any in Target Formation");
        } else {
            if (info.obscured === true) {
                outputCard.body.push("Some of the Targets are Obscured/In Cover");
            }
        }

    log(info)

        let keys = Object.keys(info.shooterInfo);
        for (let i=0;i<keys.length;i++) {
            let shooter = Units[keys[i]];
            let shooterInfo = info.shooterInfo[keys[i]];
            log(shooter.name)
            log(shooterInfo)
    
            _.each(shooterInfo, targetInfo => {
                let target = Units[targetInfo.id];
                let colour = "#00ff00";
                if (targetInfo.obscured) {
                    colour = "#ffff00";
                    if (targetInfo.cover !== false) {
                        colour = "#ff0000";
                    }
                }
                if (targetInfo.range > shooter.maxRange) {
                    colour = "#000000";
                }
                DrawLine(HexMap[shooter.hexLabel].centre, HexMap[target.hexLabel].centre, colour, "LOS");
            })


        }


        PrintCard();

        let elapsed = Date.now()-startTime;
        log("Check LOS " + elapsed/1000 + " seconds");
    }




    const LOS = (shooter,target) => {
        let shooterHex = HexMap[shooter.hexLabel];
        let targetHexes = [HexMap[target.hexLabel]];
        let distance = shooter.Distance(target);

        if (target.type === "War Engine") {
            //hexes with clear los to target hex
            let neighbours = targetHexes[0].cube.neighbours();
            let neighbourLabels = neighbours.map(cube => cube.label());
            targetHexes = [];
            _.each(neighbours,neighbour => {
                let hex = HexMap[neighbour.label()];
                let list = hex.cube.linedraw(shooterHex.cube);
                let listLabels = list.map(cube => cube.label());
                if (findCommonElements(neighbourLabels,listLabels) === false) {
                    targetHexes.push(hex);
                }
            })

        }

        let shooterHeight = shooterHex.level;
        if (shooter.special.includes("Towering")) {
            shooterHeight += 2;
        }
        let targetHeights = [targetHexes[0].level];
        if (target.special.includes("Towering")) {
            targetHeights.push(targetHexes[0].level + 2);
        }

        let cover = false;
        if (target.type === "Infantry") {
            cover = targetHexes[0].cover["Infantry"];
        } else if (target.type.includes("Vehicle")) {
            cover = targetHexes[0].cover["Vehicle"];
        }

        let obscured = (cover === false) ? false:true;

        let los = false;
        let blockLabel; //label of hex where los is blocked

        if (shooter.type === "Aircraft" || target.type === "Aircraft" || shooter.type === "Spacecraft") {
            let result = {
                distance: distance,
                los: true,
                losBlocked: "",
                cover: cover,
                obscured: obscured,
            }
            return result;
        }

        let pt1 = new Point(0,shooterHeight);

        losLoop1:
        for (let a=0;a<targetHexes.length;a++) {
            let targetHex = targetHexes[a];
log("Target Hex: " + targetHex.label)
            let interCubes = [shooterHex.cube.linedraw(targetHex.cube),shooterHex.cube.linedraw2(targetHex.cube)];
            let interLabels = [interCubes[0].map((e)=> e.label()), interCubes[1].map((e)=> e.label())];
            let len = interLabels[0].length;

            losLoop2:
            for (let j=0;j<targetHeights.length;j++) {
                let targetHeight = targetHeights[j];
log("Target Height: " + targetHeight)
                let pt2 = new Point(distance,targetHeight);

                let blocked = 0;

                losLoop3:
                for (let side=0;side<2;side++) {
log("Side: " + side)
                    for (let i=0;i<len;i++) {
                    
                        let label = interLabels[side][i];
                        let interHex = HexMap[label];
log(i + ": " + label)
log("Level: "+ interHex.level + " / Height: " + interHex.height)
                        let pt3 = new Point(i,0);
                        let pt4 = new Point(i,interHex.height);
                        if (interHex.level > shooterHeight && interHex.level > targetHeight) {
log("Hill")
                            blocked++;
                            blockLabel = label;
                            continue losLoop3;
                        }
                        let intersect = lineLine(pt1,pt2,pt3,pt4);
                        if (intersect) {
                            if (interHex.los === "Solid") {
log("Solid")
                                blocked++;
                                blockLabel = label;
                                continue losLoop3;
                            } else if (interHex.los === "Obscured") {
log("Obscured")
                                obscured = true;
                            }
                        }
                        
                        let tokenIDs = interHex.tokenIDs;
                        for (let u2=0;u2<tokenIDs.length;u2++) {
                            let unit2 = Units[tokenIDs[u2]];
                            if (unit2.id === shooter.id || unit2.id === target.id) {continue};
                            if (unit2.type === "War Engine") {
                                let height = (unit2.special.includes("Towering")) ? 2:1;
                                pt4 = new Point(i, interHex.height + height);
                                let intersect = lineLine(pt1,pt2,pt3,pt4);
                                if (intersect) {
log("War Engine")
                                    blocked++;
                                    blockLabel = label;
                                    continue losLoop3;
                                }
                            }
                        }




                    }


                }

                if (blocked < 2) {
                    if (blocked === 1) {
                        obscured = true;
                    } 
                    los = true;
                }

                if (obscured && los) {
                    break losLoop1; //if has los, only important to check if obscured
                }

                if (los) {
                    break losLoop2; //los to one height, no need to do others
                }
            }
        }

        let result = {
            distance: distance,
            los: los,
            losBlocked: blockLabel,
            cover: cover,
            obscured: obscured,
        }
        return result;
    }


    const FormationLOS = (unit1,unit2) => {


        let shooterFormation = Formations[unit1.formationID];
        let targetFormation = Formations[unit2.formationID];

        let info = {
            obscured: false,
            noLOS: true,
            shooterInfo: {},
        }

        for (let i=0;i<shooterFormation.unitIDs.length;i++) {
            let shooter = Units[shooterFormation.unitIDs[i]];
            let targetIDArray = [];

            for (let j=0;j<targetFormation.unitIDs.length;j++) {
                let target = Units[targetFormation.unitIDs[j]];
                let losResult = LOS(shooter,target);
                if (losResult.los === false) {
                    continue;
                }
                info.noLOS = false;
                if (losResult.obscured) {
                    info.obscured = true;
                }
                targetIDArray.push({
                    id: target.id,
                    range: losResult.distance,
                    obscured: losResult.obscured,
                    cover: losResult.cover,
                })
            }

            info.shooterInfo[shooter.id] = targetIDArray;
        }

        return info;
    }








    const HexData = (msg) => {
        if (!msg.selected) {return};
        let id = msg.selected[0]._id;
        let tok = findObjs({_type:"graphic", id: id})[0];
        let point = new Point(tok.get("left"),tok.get("top"));
        let cube = point.toCube();
        let label = cube.label();
        let hex = HexMap[label];
//log(hex)
        SetupCard(label,"","Neutral");
        if (hex.offboard === true) {
            outputCard.body.push("Offboard");
        } else {
            outputCard.body.push("Terrain: " + hex.terrain);
            if (hex.road) {
                outputCard.body.push("Road Present");
            }
            for (let i=0;i<6;i++) {
                let edge = hex.edges[DIRECTIONS[i]];
                if (edge !== "Open") {
                    outputCard.body.push(DIRECTIONS[i] + " Side: " + edge);
                }
            }
        }
        PrintCard();
    }


    const SizeTokens = (msg) => {
        if (!msg.selected) {
            sendChat("","No Token Selected");
            return;
        };
        _.each(msg.selected,selected => {
            let token = findObjs({_type:"graphic", id: selected._id})[0];
            token.set({
                width: HexInfo.width,
                height: HexInfo.height * 2,
            });
        })
    }


    const CreateFormation = (msg) => {
        if (!msg.selected) {return};
        let formationID = stringGen();
        let player = parseInt(msg.content.split(";")[1]);    
        let formation = new Formation(formationID,player);
        let nameList = {};
        if (state.EA.formations[player] === 0) {
            let fm = [...FormationMarkers];
            for (let i = fm.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [fm[i], fm[j]] = [fm[j], fm[i]];
            }            
            state.EA.formationMarkers[player] = fm;
        }
        let marker = state.EA.formationMarkers[player][state.EA.formations[player]];

        _.each(msg.selected,selected => {
            let id = selected._id;
            let unit = new Unit(id);
            unit.player = player;
            let name = unit.charName;
            if (nameList[name]) {
                nameList[name].units++;
                name += " " + nameList[name].units;
            } else {
                nameList[name] = {
                    firstID: id,
                    units: 1,
                }
            }
            unit.token.set("name",name);
            state.EA.unitInfo[id] = formationID;
            unit.formationID = formationID;
            if (msg.selected.length > 1) {
                unit.token.set("status_" + marker,true);
            }
            unit.token.set("disableSnapping",false);
            if (unit.dc > 1) {
                unit.token.set({
                    bar1_value: unit.dc,
                    bar1_max: unit.dc,
                    showplayers_bar1: true,
                });
            }
            if (unit.shields > 0) {
                unit.token.set({
                    bar2_value: unit.shields,
                    bar2_max: unit.shields,
                    showplayers_bar2: true,
                    aura2_color: "#00bbff80",
                    aura2_opacity: 1,
                    aura2_radius: 0.25,
                    aura2_options: "circleborder",
                })
            }
            if (unit.special.includes("Character")) {
                formation.AddUnit(id,true);
            } else {
                formation.AddUnit(id);
            }

            //AddAbilities(unit);
        })

        Units[formation.unitIDs[0]].MakeLeader();
        
        _.each(nameList,info => {
            if (info.units > 1) {
                let unit = Units[info.firstID];
                let newName = unit.token.get("name") + " 1";
                unit.name = newName;
                unit.token.set("name",newName);
            }
        })

        state.EA.formationInfo[formationID] = {
            startingHealth: formation.health,
            marker: marker,
            player: player,
        }
        state.EA.formations[player]++;
        let faction = Units[formation.unitIDs[0]].faction;
        if (state.EA.factions[player].includes(faction) === false) {
            state.EA.factions[player].push(faction);
            if (state.EA.factions[player].length === 1) {
                state.EA.strategy[player] = Factions[faction].strategy;
            }
        }
    }





    const UnitInfo = (msg) => {
        let id = msg.selected[0]._id;
        let unit = Units[id];
        if (!unit) {
            sendChat("","Not in Unit Array");
            return;
        }
        let level = parseInt(unit.token.get("currentSide"));
        SetupCard(unit.name,unit.hexLabel,unit.faction);
        if (unit.Disrupted()) {
            outputCard.body.push("Unit is Disrupted");
        }
        if (unit.Reduced()) {
            outputCard.body.push("Unit is Reduced");
        }
        if (unit.Ready()) {
            outputCard.body.push("Unit is Ready");
        } else {
            outputCard.body.push("Unit is Not Ready")
        }
        if (unit.type === "Helicopter") {
            let status = unit.HeloStatus();
            if (status === "NOE") {status = "Flying NOE"};
            outputCard.body.push("Helicopter is " + status);
        }
        if (state.EA.passengerID[unit.id]) {
            outputCard.body.push("Carrying Passenger - " + Units[state.EA.passengerID[unit.id]].name);
        }
        if (unit.type === "HQ" || unit.type === "Leader" || unit.type === "Support") {
            let parentID = Object.keys(state.EA.attachedIDs).find(key => state.EA.attachedIDs[key].includes(id));
            if (!parentID) {
                parentID = unit.AutoAttach();
            }
            if (parentID) {
                parent = Units[parentID];
                outputCard.body.push("Attached to " + parent.name);
            } else {
                outputCard.body.push("Not Attached");
            }
        }
        if (state.EA.attachedIDs[id]) {
            _.each(state.EA.attachedIDs[id],id2 => {
                let unit2 = Units[id2];
                if (unit2) {
                    outputCard.body.push(unit2.name + " is Attached");
                }
            })
        }




        let hex = HexMap[unit.hexLabel];
        if (hex.offboard === true) {
            outputCard.body.push("Offboard");
        } else {
            outputCard.body.push("Terrain: " + hex.terrain);
            if (hex.road === true) {
                outputCard.body.push("Road Present");
            }
            if (hex.improved !== false) {
                outputCard.body.push("Improved Positions");
            }
            if (hex.minefield !== false) {
                let minefield = getObj("graphic",hex.minefield);
                if (minefield && state.EA.hiddenMinefieldLocations.includes(hex.label) === false) {
                    outputCard.body.push(minefield.get("name"));
                }
            }
            if (hex.wreck !== false) {
                outputCard.body.push("Wrecks in Hex");
            }
            if (hex.rubble !== false) {
                outputCard.body.push("Rubble in Hex");
            }
            if (hex.fire !== false) {
                outputCard.body.push("Major Fires in Hex");
            }
            if (hex.burntOut !== false) {
                outputCard.body.push("Burnt Out Fire");
            }
            if (hex.smoke !== false) {
                let smoke = getObj("graphic",hex.smoke);
                outputCard.body.push(smoke.get("name") + " in Hex");
            }
            if (hex.cleared !== false) {
                outputCard.body.push("Hex is Cleared");
            }



        }
        outputCard.body.push("[hr]")
        let formation = state.EA.formationInfo[unit.formationID];
        if (formation) {
            outputCard.body.push("Formation: " + formation.name);
            outputCard.body.push("Formation Morale/Training: " + formation.morale);
        }
        if (unit.type === "Leader") {
            outputCard.body.push("Leader Morale: " + unit.leaderMorale[level]);
        } else if (unit.type === "HQ") {
            outputCard.body.push("Command Bonus: " + unit.command[level]);
            outputCard.body.push("Command Range: " + formation.commandRange[level]);
        }
        PrintCard();
    }




    const SummonToken = (cID,hexLabel,size = 70) => {
        size = size * pageInfo.scale;
        let centre = HexMap[hexLabel].centre;
        let character = getObj("character", cID);
        character.get('defaulttoken',function(defaulttoken){
            const dt = JSON.parse(defaulttoken);
            let img = dt.imgsrc;
            img = tokenImage(img);
            if(dt && img){
                dt.tint_color = "transparent";
                dt.aura1_color = "transparent";
                dt.aura1_radius = 0;
                dt.showplayers_aura1 = false;
                dt.showname =  false;
                dt.disableSnapping = true;
                dt.disableTokenMenu =true;
                dt.imgsrc=img;
                dt.left=centre.x;
                dt.top=centre.y;
                dt.pageid = pageInfo.page.get('id');
                dt.layer = "objects";
                dt.width = size;
                dt.height = size;
                let newToken = createObj("graphic", dt);
                let newUnit = new Unit(newToken.get("id"));
                return newUnit;
            } else {
                sendChat('','/w gm Cannot create token for <b>'+character.get('name')+'</b>');
            }
        });
    }


    const FX = (type, hexLabel) => {
        if (type === "HE") {
            const CreateExplosion = () => {
                let dx = randomInteger(71) - 36;
                let dy = randomInteger(71) - 36;
                let x = HexMap[hexLabel].centre.x + dx;
                let y = HexMap[hexLabel].centre.y + dy;
                let colours = ["smoke","death","fire","smoke","smoke"];
                let colour = colours[randomInteger(colours.length) - 1] || "smoke";
                spawnFx(x,y,"pooling-" + colour);
            }

            let numExplosions = 10;

            const ChainExplosions = () => {
                if (numExplosions--) {
                    CreateExplosion();
                    setTimeout(ChainExplosions,500);
                }
            }

            ChainExplosions();
        }




    }





















    const TokenInfo = (msg) => {
        let id = msg.selected[0]._id;
        let token = getObj("graphic",id);
        log(token)
    }










    const AddAbility = (abilityName,action,characterID) => {
        createObj("ability", {
            name: abilityName,
            characterid: characterID,
            action: action,
            istokenaction: true,
        })
    }    


    const AddAbilities = (unit) => {
        let abilityName,action;
        let abilArray = findObjs({_type: "ability", _characterid: unit.charID});

        //clear old abilities
        for(let a=0;a<abilArray.length;a++) {
            abilArray[a].remove();
        } 
        if (unit.type === "Artillery Token") {
            return;
        }

        if (unit.type === "HQ" || unit.special.includes("Independent"))  {
            AddAbility("Formation","!ActivateFormation",unit.charID);
        }
        if (unit.type === "HQ" || unit.type === "Leader" || unit.type === "Support") {
            AddAbility("Attach","!Misc;Attach;@{target|Attach To|token_id}",unit.charID);
        } else if (unit.type !== "Helicopter") {
            let orders = "?{Order|Move";
            if (unit.weapons.length > 0) {
                orders += "|Move and Direct Fire|Direct Fire";
            }
            if (unit.artWeapon !== "") {
                orders += "|Indirect Fire";
            }
            if (unit.assaultFP) {
                orders += "|Assault"
            }
            orders += "}";
            action = "!Activate;" + orders;
            AddAbility("Activate Unit",action,unit.charID);
        } else if (unit.type === "Helicopter") {

            let orders = "?{Order|NOE Move|Flying Move|Flying Move and Fire|Hover and Fire";
            if (unit.special.includes("Transport")) {
                orders += "|Land";
                if (unit.weapons.length > 0) {
                    orders += " and Fire";
                }
            }
            orders += "}";
            action = "!Activate;" + orders;



            AddAbility("Activate Unit",action,unit.charID);
        }






        if (unit.special.includes("Transport")) {
            AddAbility("Load","!Misc;Load;@{target|Passenger|token_id}",unit.charID);
        }
        if (unit.special.includes("Transport")) {
            AddAbility("Unload","!Misc;Unload",unit.charID);
        }


        let weapons = [];
        if (unit.weapons.length > 0) {
            for (let w=0;w<unit.weapons.length;w++) {
                if (unit.weapons[w].notes.includes("Indirect")) {continue};
                weapons.push(unit.weapons[w].name);
            }
        }
        weapons = [...new Set(weapons)];

        let w = 1;
        _.each(weapons,weapon => {
            abilityName = w + ": " + weapon
            action = "!DirectFire;@{selected|token_id};@{target|token_id};" + weapon;
            AddAbility(abilityName,action,unit.charID);
            w++;
        })



    }

    const CreateMarker = (hex,type,layer = "map",cost = 0,img,charID) => {
        let c = hex.centre;
        let width,height,deltaLeft,deltaTop,markerName;
        let rotation = 0;
        if (type === "Move") {
            cost = Math.round(cost);
            img = getCleanImgSrc(MoveMarkers[cost]);
            width = 25;
            height = 25;
            deltaLeft = 0;
            deltaTop = 50;
            markerName = "Map Marker";
        }  
        if (type === "Fire") {
            img = "https://files.d20.io/images/444760310/hU74_47luSi2mkY1ejzjcQ/thumb.png?1749828980";
            width = 70;
            height = 80;
            deltaLeft = 0;
            deltaTop = 0;
            rotation = randomInteger(360);
            markerName = "Fire";
        }
        if (type === "BurntOut") {
            img = "https://files.d20.io/images/505755411/L0HHIoEj1V1X8s7v26a7qQ/thumb.avif?1793288319";
            width = 60;
            height = 70;
            deltaLeft = 0;
            deltaTop = 0;
            markerName = "BurntOut";
            rotation = randomInteger(360);
        }
        if (type === "Placed Minefield") {
            img = "https://files.d20.io/images/505777861/9mXv-M-ZFckh52Mr_Euztw/thumb.webp?1793302950";
            width = 60;
            height = 60;
            deltaLeft = 0;
            deltaTop = 0;
            markerName = "Placed Minefield";
            rotation = randomInteger(360);
        }
        if (type === "Random Minefield") {
            img = "https://files.d20.io/images/505793211/A1kfn3sCzAg-FkV8YY0RpQ/thumb.png?1793312501";
            width = 60;
            height = 60;
            deltaLeft = 0;
            deltaTop = 0;
            markerName = "Random Minefield";
            rotation = randomInteger(360);
        }
        if (type === "Collapsed Bridge") {
            img = "https://files.d20.io/images/506243513/gEK1bAG5_Q-yUjoiVZX-2A/thumb.png?1793658390";
            width = 70;
            height = 20;

            let deltas = {"North": [0,-35], "Northeast": [25,-25],"Southeast": [25,25], "South": [0,35], "Southwest": [-25,25],"Northwest": [-25,-25]};
            let rotations = {"North": 0,"Northeast": 45, "Southeast": -45, "South": 0, "Southwest": 45, "Northwest": -45};

            deltaLeft = deltas[cost][0];
            deltaTop = deltas[cost][1];
            markerName = "Collapsed Bridge";
            rotation = rotations[cost];
        }

        if (type === "Rubble") {
            img = "https://files.d20.io/images/77961532/DcvUgeQt27Ip3NMDRhL2bQ/thumb.png?1554150576";
            width = 70;
            height = 80;
            deltaLeft = 0;
            deltaTop = 0;
            rotation = randomInteger(360);
            markerName = "Rubble";
        }


        if (type === "Smoke") {
            img = "https://files.d20.io/images/196609276/u8gp3vcjYAunqphuw6tgWw/thumb.png?1611938031";
            width = 80;
            height = 80;
            deltaLeft = 0;
            deltaTop = 0;
            rotation = randomInteger(360);
            markerName = "Smoke";
            charID = "-P5CWq0Pa22hd7EqjqZ7";
            layer = "foreground";
        }
        if (type === "Dispersed Smoke") {
            img = "https://files.d20.io/images/196609296/i7Z60RNt9RLwdAuC911UBw/thumb.png?1611938037";
            width = 80;
            height = 80;
            deltaLeft = 0;
            deltaTop = 0;
            rotation = randomInteger(360);
            markerName = "Dispersed Smoke";
            layer = "foreground";
        }
        if (type === "Wreck") {
            width = 80;
            height = 65;
            deltaLeft = 0;
            deltaTop = 0;
            markerName = "Wreck";
            layer = "map";
            img = "https://files.d20.io/images/505754200/CPe5JvMCpBFAx79NGuhz4g/thumb.png?1793287244";
        }
        if (type === "Chemical") {
            width = 80;
            height = 80;
            deltaLeft = 0;
            deltaTop = 0;
            markerName = "Chemical";
            layer = "foreground";
            img = "https://files.d20.io/images/505859483/caBaVUt0iwODzkh1cGKZmg/thumb.webp?1793379338";
        }



        img = getCleanImgSrc(img);


        let newToken = createObj("graphic", {
            left: c.x + deltaLeft,
            top: c.y + deltaTop,
            rotation: rotation,
            width: width,
            height: height, 
            name: markerName,
            pageid: Campaign().get("playerpageid"),
            imgsrc: img,
            layer: layer,
        })

        if (charID && newToken) {
            newToken.set("represents",charID);
        }

        if (newToken) {
            toFront(newToken);
        } 

        return newToken.id;
    }

    const MoveHex = (newLabel,prevLabel,unit) => {
        let newHex = HexMap[newLabel];
        let prevHex = HexMap[prevLabel];
        let oldLabels = [prevLabel];
        let newLabels = [newLabel];
        if (unit.type === "War Engine") {
            _.each(newHex.cube.neighbours(),neighbour => {
                newLabels.push(neighbour.label())
            })
            _.each(prevHex.cube.neighbours(),neighbour => {
                oldLabels.push(neighbour.label())
            })
        }
        let illegal = false;
        for (let i=0;i<newLabels.length;i++) {
            let label = newLabels[i];
            let hex = HexMap[label];
            if ((hex.move["Infantry"] === "Impassable" && unit.type === "Infantry") || (hex.move["Vehicle"] === "Impassable" && unit.type.includes("Vehicle")) || (hex.move["War Engine"] === "Impassable" && unit.type === "War Engine")) {
                illegal = true;
                break;
            }
        }
        if (illegal === true) {
            PlaySound("Bap")
            tok.set({
                left: prevHex.centre.x,
                top: prevHex.centre.y,
            })        
            return;
        }

        unit.hexLabel = newLabel;

        _.each(oldLabels,label => {
            let hex = HexMap[label];
            let index = hex.tokenIDs.indexOf(unit.id);
            if (index > -1) {
                hex.tokenIDs.splice(index,1);
            }
        })
        _.each(newLabels,label => {
            let hex = HexMap[label];
            let index = hex.tokenIDs.indexOf(unit.id);
            if (index === -1) {
                hex.tokenIDs.push(unit.id);
            }
        })
    }








    const changeGraphic = (tok,prev) => {
        let unit = Units[tok.id];
        let newLabel = new Point(tok.get("left"),tok.get("top")).toCube().label();
        let prevLabel = new Point(prev.left,prev.top).toCube().label();
        if (unit && newLabel !== prevLabel) {
            MoveHex(newLabel,prevLabel,unit);
        }
        if ((tok.get("height") !== prev.height || tok.get("width") !== prev.width) && state.EA.turn !== 0) {
            tok.set({
                height: prev.height,
                width: prev.width,
            })
        }

    }



    const destroyGraphic = (tok,prev) => {
        if (tok.get('subtype') === "token") {
            let id = tok.id;
            let unit = Formations[id];
            if (unit) {
                delete Formations[id];
            }
            let pt = new Point(tok.get("left"),tok.get("top"));
            let cube = pt.toCube();
            let label = cube.label();
            let hex = HexMap[label]
            let index = hex.tokenIDs.indexOf(id);
            if (index > -1) {
                hex.tokenIDs.splice(index,1);
            }
        }
    }






    const handleInput = (msg) => {
        if (msg.type !== "api") {
            return;
        }
        let args = msg.content.split(";");
        log(args);
    
        switch(args[0]) {
            case '!Dump':   
                log(pageInfo);
                log("STATE");
                log(state.EA);
                log("Formations");
                log(Formations);
                break;
            case '!ClearState':
                ClearState(msg);
                break;
            case '!TokenInfo':
                TokenInfo(msg);
                break;
            case '!CheckLOS':
                CheckLOS(msg);
                break;
            case '!HexData':
                HexData(msg);
                break;
            case '!UnitInfo':
                UnitInfo(msg);
                break;
            case '!CreateFormation':
                CreateFormation(msg);
                break;
            case '!NextPhase':
                NextPhase();
                break;
            case '!RollD6':
                RollD6(msg);
                break;
            case '!Activate':
                Activate(msg);
                break;
            case '!GroupLOS':
                GroupLOS(msg);
                break;


        }
    };



    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:graphic',changeGraphic);
        //on('destroy:graphic',destroyGraphic);
    };
    on('ready', () => {
        log("===> Epic Armageddon <===");
        log("===> Software Date: " + version + " <===")
        LoadPage();
        DefineHexInfo();
        BuildMap();
        registerEventHandlers();
        sendChat("","API Ready at " + new Date().toLocaleTimeString("en-US", {timeZone: "America/Toronto"}) + " EST");
        log("On Ready Done")
    });
    return {
        // Public interface here
    };






})();


