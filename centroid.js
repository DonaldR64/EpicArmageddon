const Centroid = (formation) => {
    let xTotal = 0;
    let yTotal = 0;
    let len = formation.unitIDs.length;
    for (let i=0;i<len;i++) {
        let unit = Units(formation.unitIDs[i]);
        if (unit) {
            xTotal += HexMap[unit.hexLabel].centre.x;
            yTotal += HexMap[unit.hexLabel].centre.y;
        }
    }
    let centroidPoint = new Point((xTotal/len),(yTotal/len));
    let centroid = centroidPoint.label();
    return centroid;
}