function CAnimCharacter(oAnim) {

    var _oAnimation = oAnim;


    this.animation = function (vDirAnim, oCharacter) {

        if (this.notChangeAnim(oCharacter)) {
            return;
        }
        if (Math.abs(vDirAnim.getX()) > Math.abs(vDirAnim.getY())) {
            if (vDirAnim.getX() > 0) {
                if (oCharacter.getAnimType() !== _oAnimation.a) {
                    oCharacter.runAnim(_oAnimation.a);
                }
            } else {
                if (oCharacter.getAnimType() !== _oAnimation.b) {
                    oCharacter.runAnim(_oAnimation.b);
                }
            }

        } else {
            if (vDirAnim.getY() > 0) {
                if (oCharacter.getAnimType() !== _oAnimation.c) {
                    oCharacter.runAnim(_oAnimation.c);
                }
            } else {
                if (oCharacter.getAnimType() !== _oAnimation.d) {
                    oCharacter.runAnim(_oAnimation.d);
                }
            }
        }
    };

    this.notChangeAnim = function (oCharacter) {
        switch (oCharacter.getAnimType()) {
            case  _oAnimation.a:
            case _oAnimation.b:
            case _oAnimation.c:
            case  _oAnimation.d:
                return oCharacter.runAnimCharacter();
                break;
        }
        return false;
    };

    return this;
}