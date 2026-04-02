function CVector3(iX, iY, iZ) {

    var x;
    var y;
    var z;
		
    this._init = function(iX, iY, iZ) {
        x = iX; 
        y = iY;
        z = iZ;
    };

    this.add = function (vx, vy, vz) {
        x += vx;
        y += vy;
        z += vz;
    };
    
    this.addV = function (v) {
        x += v.getX();
        y += v.getY();
        z += v.getZ();
    };
    
    this.scalarDivision = function(n) {
        x /= n;
        y /= n;	
        z /= n;	
    };
    
    this.subtract = function (vx, vy, vz) {
        x -= vx;
        y -= vy;
        z -= vz;
    };
    
    this.subtractV = function (v) {
        x -= v.getX();
        y -= v.getY();
        z -= v.getZ();
    };
    
    this.scalarProduct = function(n){
        x *= n;
        y *= n;
        z *= n;
    };
    
    this.invert = function(){
        x *= -1;
        y *= -1;
        z *= -1;	
    };
    
    this.dotProduct = function (v) {
        return (x * v.getX() + y * v.getY() + z * v.getZ());
    };
    
    this.set = function(fx, fy, fz){
        x = fx;
        y = fy;
        z = fz;
    };
    
    this.setV = function (v) {
        x = v.getX();
        y = v.getY();
        z = v.getZ();
    };

    this.length = function(){
        return Math.sqrt( x*x+y*y+z*z );
    };
    
    this.lengthSquare = function(){
        return x*x+y*y+z*z;
    };
    
    this.normalize = function(){
        var len = this.length();
        if (len > 0 ){
            x/= len; 
            y/= len; 
            z/= len; 
        }
    };

    this.getNormalize = function (outV) {
        var len = this.length();
        outV.set(x, y, z);
        outV.normalize();
    };
    
    this.ceil = function () {
        x = Math.ceil(x);
        y = Math.ceil(y);
        z = Math.ceil(z);
    };
    this.round = function () {
        x = Math.round(x);
        y = Math.round(y);
        z = Math.round(z);
    };

    this.getX = function () {
        return x;
    };
    
    this.getY = function () {
        return y;
    };
    
    this.getZ = function () {
        return z;
    };
    
    this.toString = function () {
        return "Vector3: " + x + ", " + y + ", " + z;
    };
    
    this.print = function () {
        trace("Vector3: " + x + ", " + y + ", " + z);
    };
    
    this._init(iX, iY, iZ);
}