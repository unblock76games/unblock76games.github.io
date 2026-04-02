function toRadian(iValue){
    return ((iValue) * (Math.PI  /180));
}

function toDegree( n ) {
    return ((n) * (180 / Math.PI));
}

function randRange(min, max) {	
    return (Math.floor(Math.random() * (max - min + 1)) + min) ;
}

function angleBetweenVectors( v1, v2){
    var iAngle= Math.acos( dotProductV2( v1, v2 ) / (v1.length() * v2.length()) );
    if ( isNaN( iAngle ) === true ){
        return 0;
    }else{
        return iAngle;
    }
}

function normalize(v){
        var len = this._length(v);
        if (len > 0 ){
                return { x : (v.x/len), y : (v.y/len) }; 
        }
        return v;
};

this._length = function(v){
        return Math.sqrt( v.x*v.x+v.y*v.y );
};

	

function rot90CW(v){
        return { x: v.y, y : -v.x};
};

function rot90CCW(v){
        return { x: -v.y, y : v.x};
};
    
function rotateVector2D( iAngle, v ) {		
    var iX = v.getX() *   Math.cos( iAngle )  + v.getY() * Math.sin( iAngle );
    var iY = v.getX() * (-Math.sin( iAngle )) + v.getY() * Math.cos( iAngle );		
    v.set( iX, iY );
}

function reflectVectorV2( v, n ) {
    var vRet = new CVector2();
    var dotP  = dotProductV2( v,n );
    vRet.set( (v.getX() - (2 * dotP * n.getX())), (v.getY() - (2 * dotP * n.getY())) );
    return vRet;
}

function dotProductV2(v1,v2){
    return ( v1.getX()*v2.getX()+ v1.getY() * v2.getY() );
}

function pointInRect(p, r) {
    return p.getX() > r.x && p.getX() < (r.x + r.width) && p.getY() > r.y && p.getY() < (r.y + r.height);
}

function distance( v1, v2 ){
    return Math.sqrt( (v2.x-v1.x)*(v2.x-v1.x) ) + ( (v2.y-v1.y)*(v2.y-v1.y) );
}

function distance2( v1, v2 ){
    return ( (v2.getX()-v1.getX())*(v2.getX()-v1.getX()) ) + ( (v2.getY()-v1.getY())*(v2.getY()-v1.getY()) );
}

function circleCollision (oCircle1Pos, oCircle2Pos,iRadius) {
    var a;
    var x;
    var y;

    a = iRadius + iRadius;
    x = oCircle1Pos.x - oCircle2Pos.x;
    y = oCircle1Pos.y - oCircle2Pos.y;

    if ( a > Math.sqrt( (x*x) + (y*y) ) ) {
        return true;
    } else {
        return false;
    }   
}