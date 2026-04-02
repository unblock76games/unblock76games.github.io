(function (lib, img, cjs) {

var p; // shortcut to reference prototypes

// library properties:
lib.properties = {
	width: 405,
	height: 720,
	fps: 30,
	color: "#FFFFFF",
	manifest: [
		{src:"images/Bitmap1.png", id:"Bitmap1"},
		{src:"images/Bitmap10.png", id:"Bitmap10"},
		{src:"images/Bitmap100.png", id:"Bitmap100"},
		{src:"images/Bitmap101.png", id:"Bitmap101"},
		{src:"images/Bitmap102.png", id:"Bitmap102"},
		{src:"images/Bitmap104.png", id:"Bitmap104"},
		{src:"images/Bitmap106.png", id:"Bitmap106"},
		{src:"images/Bitmap107.png", id:"Bitmap107"},
		{src:"images/Bitmap108.png", id:"Bitmap108"},
		{src:"images/Bitmap109.png", id:"Bitmap109"},
		{src:"images/Bitmap11.png", id:"Bitmap11"},
		{src:"images/Bitmap1101.png", id:"Bitmap1101"},
		{src:"images/Bitmap111.png", id:"Bitmap111"},
		{src:"images/Bitmap112.png", id:"Bitmap112"},
		{src:"images/Bitmap113.png", id:"Bitmap113"},
		{src:"images/Bitmap114.png", id:"Bitmap114"},
		{src:"images/Bitmap115.png", id:"Bitmap115"},
		{src:"images/Bitmap116.png", id:"Bitmap116"},
		{src:"images/Bitmap117.png", id:"Bitmap117"},
		{src:"images/Bitmap118.png", id:"Bitmap118"},
		{src:"images/Bitmap119.png", id:"Bitmap119"},
		{src:"images/Bitmap12.png", id:"Bitmap12"},
		{src:"images/Bitmap120.png", id:"Bitmap120"},
		{src:"images/Bitmap121.png", id:"Bitmap121"},
		{src:"images/Bitmap122.png", id:"Bitmap122"},
		{src:"images/Bitmap123.png", id:"Bitmap123"},
		{src:"images/Bitmap124.png", id:"Bitmap124"},
		{src:"images/Bitmap125.png", id:"Bitmap125"},
		{src:"images/Bitmap125_1.png", id:"Bitmap125_1"},
		{src:"images/Bitmap126.png", id:"Bitmap126"},
		{src:"images/Bitmap127.png", id:"Bitmap127"},
		{src:"images/Bitmap128.png", id:"Bitmap128"},
		{src:"images/Bitmap129.png", id:"Bitmap129"},
		{src:"images/Bitmap13.png", id:"Bitmap13"},
		{src:"images/Bitmap130.png", id:"Bitmap130"},
		{src:"images/Bitmap131.png", id:"Bitmap131"},
		{src:"images/Bitmap132.png", id:"Bitmap132"},
		{src:"images/Bitmap133.png", id:"Bitmap133"},
		{src:"images/Bitmap134.png", id:"Bitmap134"},
		{src:"images/Bitmap135.png", id:"Bitmap135"},
		{src:"images/Bitmap136.png", id:"Bitmap136"},
		{src:"images/Bitmap137.png", id:"Bitmap137"},
		{src:"images/Bitmap138.png", id:"Bitmap138"},
		{src:"images/Bitmap14.png", id:"Bitmap14"},
		{src:"images/Bitmap140.png", id:"Bitmap140"},
		{src:"images/Bitmap141.png", id:"Bitmap141"},
		{src:"images/Bitmap143.png", id:"Bitmap143"},
		{src:"images/Bitmap144.png", id:"Bitmap144"},
		{src:"images/Bitmap145.png", id:"Bitmap145"},
		{src:"images/Bitmap146.png", id:"Bitmap146"},
		{src:"images/Bitmap147.png", id:"Bitmap147"},
		{src:"images/Bitmap148.png", id:"Bitmap148"},
		{src:"images/Bitmap149.png", id:"Bitmap149"},
		{src:"images/Bitmap15.png", id:"Bitmap15"},
		{src:"images/Bitmap150.png", id:"Bitmap150"},
		{src:"images/Bitmap151.png", id:"Bitmap151"},
		{src:"images/Bitmap16.png", id:"Bitmap16"},
		{src:"images/Bitmap17.png", id:"Bitmap17"},
		{src:"images/Bitmap18.png", id:"Bitmap18"},
		{src:"images/Bitmap19.png", id:"Bitmap19"},
		{src:"images/Bitmap2.png", id:"Bitmap2"},
		{src:"images/Bitmap20.png", id:"Bitmap20"},
		{src:"images/Bitmap21.png", id:"Bitmap21"},
		{src:"images/Bitmap22.png", id:"Bitmap22"},
		{src:"images/Bitmap23.png", id:"Bitmap23"},
		{src:"images/Bitmap24.png", id:"Bitmap24"},
		{src:"images/Bitmap25.png", id:"Bitmap25"},
		{src:"images/Bitmap26.png", id:"Bitmap26"},
		{src:"images/Bitmap27.png", id:"Bitmap27"},
		{src:"images/Bitmap28.png", id:"Bitmap28"},
		{src:"images/Bitmap29.png", id:"Bitmap29"},
		{src:"images/Bitmap3.png", id:"Bitmap3"},
		{src:"images/Bitmap30.png", id:"Bitmap30"},
		{src:"images/Bitmap31.png", id:"Bitmap31"},
		{src:"images/Bitmap32.png", id:"Bitmap32"},
		{src:"images/Bitmap33.png", id:"Bitmap33"},
		{src:"images/Bitmap35.png", id:"Bitmap35"},
		{src:"images/Bitmap36.png", id:"Bitmap36"},
		{src:"images/Bitmap37.png", id:"Bitmap37"},
		{src:"images/Bitmap38.png", id:"Bitmap38"},
		{src:"images/Bitmap39.png", id:"Bitmap39"},
		{src:"images/Bitmap4.png", id:"Bitmap4"},
		{src:"images/Bitmap40.png", id:"Bitmap40"},
		{src:"images/Bitmap41.png", id:"Bitmap41"},
		{src:"images/Bitmap42.png", id:"Bitmap42"},
		{src:"images/Bitmap43.png", id:"Bitmap43"},
		{src:"images/Bitmap44.png", id:"Bitmap44"},
		{src:"images/Bitmap45.png", id:"Bitmap45"},
		{src:"images/Bitmap46.png", id:"Bitmap46"},
		{src:"images/Bitmap47.png", id:"Bitmap47"},
		{src:"images/Bitmap48.png", id:"Bitmap48"},
		{src:"images/Bitmap49.png", id:"Bitmap49"},
		{src:"images/Bitmap5.png", id:"Bitmap5"},
		{src:"images/Bitmap50.png", id:"Bitmap50"},
		{src:"images/Bitmap51.png", id:"Bitmap51"},
		{src:"images/Bitmap52.png", id:"Bitmap52"},
		{src:"images/Bitmap53.png", id:"Bitmap53"},
		{src:"images/Bitmap54.png", id:"Bitmap54"},
		{src:"images/Bitmap55.png", id:"Bitmap55"},
		{src:"images/Bitmap561.png", id:"Bitmap561"},
		{src:"images/Bitmap57.png", id:"Bitmap57"},
		{src:"images/Bitmap58.png", id:"Bitmap58"},
		{src:"images/Bitmap59.png", id:"Bitmap59"},
		{src:"images/Bitmap6.png", id:"Bitmap6"},
		{src:"images/Bitmap60.png", id:"Bitmap60"},
		{src:"images/Bitmap62.png", id:"Bitmap62"},
		{src:"images/Bitmap63.png", id:"Bitmap63"},
		{src:"images/Bitmap66.png", id:"Bitmap66"},
		{src:"images/Bitmap67.png", id:"Bitmap67"},
		{src:"images/Bitmap7.png", id:"Bitmap7"},
		{src:"images/Bitmap78.png", id:"Bitmap78"},
		{src:"images/Bitmap79.png", id:"Bitmap79"},
		{src:"images/Bitmap8.png", id:"Bitmap8"},
		{src:"images/Bitmap80.png", id:"Bitmap80"},
		{src:"images/Bitmap81.png", id:"Bitmap81"},
		{src:"images/Bitmap82.png", id:"Bitmap82"},
		{src:"images/Bitmap83.png", id:"Bitmap83"},
		{src:"images/Bitmap84.png", id:"Bitmap84"},
		{src:"images/Bitmap85.png", id:"Bitmap85"},
		{src:"images/Bitmap86.png", id:"Bitmap86"},
		{src:"images/Bitmap87.png", id:"Bitmap87"},
		{src:"images/Bitmap88.png", id:"Bitmap88"},
		{src:"images/Bitmap89.png", id:"Bitmap89"},
		{src:"images/Bitmap9.png", id:"Bitmap9"},
		{src:"images/Bitmap90.png", id:"Bitmap90"},
		{src:"images/Bitmap91.png", id:"Bitmap91"},
		{src:"images/Bitmap97.png", id:"Bitmap97"},
		{src:"images/Bitmap98.png", id:"Bitmap98"},
		{src:"images/Bitmap99.png", id:"Bitmap99"},
		{src:"images/recptiek.png", id:"recptiek"},
		{src:"images/tlacitko.png", id:"tlacitko"},
		{src:"sounds/drvenie_cukru.mp3", id:"drvenie_cukru"},
		{src:"sounds/drvicka_neg.mp3", id:"drvicka_neg"},
		{src:"sounds/drvicka_stol.mp3", id:"drvicka_stol"},
		{src:"sounds/drvicka_tah.mp3", id:"drvicka_tah"},
		{src:"sounds/dvere_neg.mp3", id:"dvere_neg"},
		{src:"sounds/dvere_otvor.mp3", id:"dvere_otvor"},
		{src:"sounds/dvere_otvor_2.mp3", id:"dvere_otvor_2"},
		{src:"sounds/dvere_zatvor.mp3", id:"dvere_zatvor"},
		{src:"sounds/EheeheHlb.mp3", id:"EheeheHlb"},
		{src:"sounds/ehe_hlb.mp3", id:"ehe_hlb"},
		{src:"sounds/gong.mp3", id:"gong"},
		{src:"sounds/kucharik_sup_von.mp3", id:"kucharik_sup_von"},
		{src:"sounds/liatie_na_maffin.mp3", id:"liatie_na_maffin"},
		{src:"sounds/lizacka_spat.mp3", id:"lizacka_spat"},
		{src:"sounds/lizacka_von.mp3", id:"lizacka_von"},
		{src:"sounds/lizicka_neg.mp3", id:"lizicka_neg"},
		{src:"sounds/miesanie_mixu.mp3", id:"miesanie_mixu"},
		{src:"sounds/miska_na_stol.mp3", id:"miska_na_stol"},
		{src:"sounds/miska_neg.mp3", id:"miska_neg"},
		{src:"sounds/mlieko_na_policku.mp3", id:"mlieko_na_policku"},
		{src:"sounds/mlieko_neg.mp3", id:"mlieko_neg"},
		{src:"sounds/mlieko_tecie.mp3", id:"mlieko_tecie"},
		{src:"sounds/mrkva_neg.mp3", id:"mrkva_neg"},
		{src:"sounds/mrkva_stol.mp3", id:"mrkva_stol"},
		{src:"sounds/muffinova_forma_neg.mp3", id:"muffinova_forma_neg"},
		{src:"sounds/muffinova_forma_von.mp3", id:"muffinova_forma_von"},
		{src:"sounds/naber_sypke.mp3", id:"naber_sypke"},
		{src:"sounds/olej_neg.mp3", id:"olej_neg"},
		{src:"sounds/olej_tecie.mp3", id:"olej_tecie"},
		{src:"sounds/potlesk.mp3", id:"potlesk"},
		{src:"sounds/rura_neg.mp3", id:"rura_neg"},
		{src:"sounds/rura_pecie.mp3", id:"rura_pecie"},
		{src:"sounds/sirup_sa_leje.mp3", id:"sirup_sa_leje"},
		{src:"sounds/sol_na_stol.mp3", id:"sol_na_stol"},
		{src:"sounds/sol_neg.mp3", id:"sol_neg"},
		{src:"sounds/Star1.mp3", id:"Star1"},
		{src:"sounds/Star2.mp3", id:"Star2"},
		{src:"sounds/Star3.mp3", id:"Star3"},
		{src:"sounds/struh_mrkva_do_misky.mp3", id:"struh_mrkva_do_misky"},
		{src:"sounds/struhadlo_stol.mp3", id:"struhadlo_stol"},
		{src:"sounds/struhanie_mrkvy.mp3", id:"struhanie_mrkvy"},
		{src:"sounds/suflik_neg.mp3", id:"suflik_neg"},
		{src:"sounds/suflik_otvor.mp3", id:"suflik_otvor"},
		{src:"sounds/suflik_zatvor.mp3", id:"suflik_zatvor"},
		{src:"sounds/tanier_neg.mp3", id:"tanier_neg"},
		{src:"sounds/tanier_stol.mp3", id:"tanier_stol"},
		{src:"sounds/vareska_von.mp3", id:"vareska_von"},
		{src:"sounds/vaza_neg.mp3", id:"vaza_neg"},
		{src:"sounds/vazurue_hlb.mp3", id:"vazurue_hlb"},
		{src:"sounds/vylievanie_do_formy.mp3", id:"vylievanie_do_formy"},
		{src:"sounds/vysyp_sypke.mp3", id:"vysyp_sypke"},
		{src:"sounds/zatka.mp3", id:"zatka"},
		{src:"sounds/ZIP1.mp3", id:"ZIP1"},
		{src:"sounds/zmurk.mp3", id:"zmurk"},
		{src:"sounds/ZoomSound.mp3", id:"ZoomSound"},
		{src:"sounds/zoom_sound.mp3", id:"zoom_sound"}
	]
};



// symbols:



(lib.Bitmap1 = function() {
	this.initialize(img.Bitmap1);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,217,397);


(lib.Bitmap10 = function() {
	this.initialize(img.Bitmap10);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,16,41);


(lib.Bitmap100 = function() {
	this.initialize(img.Bitmap100);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,106,26);


(lib.Bitmap101 = function() {
	this.initialize(img.Bitmap101);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,26,45);


(lib.Bitmap102 = function() {
	this.initialize(img.Bitmap102);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,58,10);


(lib.Bitmap104 = function() {
	this.initialize(img.Bitmap104);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,78,41);


(lib.Bitmap106 = function() {
	this.initialize(img.Bitmap106);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,76,83);


(lib.Bitmap107 = function() {
	this.initialize(img.Bitmap107);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,76,80);


(lib.Bitmap108 = function() {
	this.initialize(img.Bitmap108);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,85,80);


(lib.Bitmap109 = function() {
	this.initialize(img.Bitmap109);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,116,28);


(lib.Bitmap11 = function() {
	this.initialize(img.Bitmap11);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,155,107);


(lib.Bitmap1101 = function() {
	this.initialize(img.Bitmap1101);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,85,94);


(lib.Bitmap111 = function() {
	this.initialize(img.Bitmap111);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,52,110);


(lib.Bitmap112 = function() {
	this.initialize(img.Bitmap112);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,34,87);


(lib.Bitmap113 = function() {
	this.initialize(img.Bitmap113);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,32,82);


(lib.Bitmap114 = function() {
	this.initialize(img.Bitmap114);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,26,34);


(lib.Bitmap115 = function() {
	this.initialize(img.Bitmap115);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,56,12);


(lib.Bitmap116 = function() {
	this.initialize(img.Bitmap116);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,83,60);


(lib.Bitmap117 = function() {
	this.initialize(img.Bitmap117);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,28,55);


(lib.Bitmap118 = function() {
	this.initialize(img.Bitmap118);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,51,90);


(lib.Bitmap119 = function() {
	this.initialize(img.Bitmap119);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,105,180);


(lib.Bitmap12 = function() {
	this.initialize(img.Bitmap12);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,90,32);


(lib.Bitmap120 = function() {
	this.initialize(img.Bitmap120);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,179,105);


(lib.Bitmap121 = function() {
	this.initialize(img.Bitmap121);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,5,62);


(lib.Bitmap122 = function() {
	this.initialize(img.Bitmap122);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,47,8);


(lib.Bitmap123 = function() {
	this.initialize(img.Bitmap123);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,117,21);


(lib.Bitmap124 = function() {
	this.initialize(img.Bitmap124);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,96,29);


(lib.Bitmap125 = function() {
	this.initialize(img.Bitmap125);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,233,56);


(lib.Bitmap125_1 = function() {
	this.initialize(img.Bitmap125_1);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,234,47);


(lib.Bitmap126 = function() {
	this.initialize(img.Bitmap126);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,103,70);


(lib.Bitmap127 = function() {
	this.initialize(img.Bitmap127);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,477,113);


(lib.Bitmap128 = function() {
	this.initialize(img.Bitmap128);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,89,80);


(lib.Bitmap129 = function() {
	this.initialize(img.Bitmap129);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,76,89);


(lib.Bitmap13 = function() {
	this.initialize(img.Bitmap13);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,90,32);


(lib.Bitmap130 = function() {
	this.initialize(img.Bitmap130);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,76,93);


(lib.Bitmap131 = function() {
	this.initialize(img.Bitmap131);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,49,83);


(lib.Bitmap132 = function() {
	this.initialize(img.Bitmap132);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,7,30);


(lib.Bitmap133 = function() {
	this.initialize(img.Bitmap133);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,53,19);


(lib.Bitmap134 = function() {
	this.initialize(img.Bitmap134);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,894,101);


(lib.Bitmap135 = function() {
	this.initialize(img.Bitmap135);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,24,37);


(lib.Bitmap136 = function() {
	this.initialize(img.Bitmap136);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,50,37);


(lib.Bitmap137 = function() {
	this.initialize(img.Bitmap137);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,65,60);


(lib.Bitmap138 = function() {
	this.initialize(img.Bitmap138);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,876,715);


(lib.Bitmap14 = function() {
	this.initialize(img.Bitmap14);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,90,32);


(lib.Bitmap140 = function() {
	this.initialize(img.Bitmap140);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,1241,451);


(lib.Bitmap141 = function() {
	this.initialize(img.Bitmap141);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,115,116);


(lib.Bitmap143 = function() {
	this.initialize(img.Bitmap143);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,218,166);


(lib.Bitmap144 = function() {
	this.initialize(img.Bitmap144);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,134,142);


(lib.Bitmap145 = function() {
	this.initialize(img.Bitmap145);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,115,135);


(lib.Bitmap146 = function() {
	this.initialize(img.Bitmap146);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,586,722);


(lib.Bitmap147 = function() {
	this.initialize(img.Bitmap147);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,405,138);


(lib.Bitmap148 = function() {
	this.initialize(img.Bitmap148);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,725,927);


(lib.Bitmap149 = function() {
	this.initialize(img.Bitmap149);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,217,397);


(lib.Bitmap15 = function() {
	this.initialize(img.Bitmap15);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,76,82);


(lib.Bitmap150 = function() {
	this.initialize(img.Bitmap150);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,292,459);


(lib.Bitmap151 = function() {
	this.initialize(img.Bitmap151);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,458,600);


(lib.Bitmap16 = function() {
	this.initialize(img.Bitmap16);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,33,63);


(lib.Bitmap17 = function() {
	this.initialize(img.Bitmap17);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,94,80);


(lib.Bitmap18 = function() {
	this.initialize(img.Bitmap18);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,71,13);


(lib.Bitmap19 = function() {
	this.initialize(img.Bitmap19);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,94,80);


(lib.Bitmap2 = function() {
	this.initialize(img.Bitmap2);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,367,432);


(lib.Bitmap20 = function() {
	this.initialize(img.Bitmap20);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,87,96);


(lib.Bitmap21 = function() {
	this.initialize(img.Bitmap21);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,75,13);


(lib.Bitmap22 = function() {
	this.initialize(img.Bitmap22);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,55,7);


(lib.Bitmap23 = function() {
	this.initialize(img.Bitmap23);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,32,30);


(lib.Bitmap24 = function() {
	this.initialize(img.Bitmap24);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,88,80);


(lib.Bitmap25 = function() {
	this.initialize(img.Bitmap25);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,29,11);


(lib.Bitmap26 = function() {
	this.initialize(img.Bitmap26);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,34,12);


(lib.Bitmap27 = function() {
	this.initialize(img.Bitmap27);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,84,80);


(lib.Bitmap28 = function() {
	this.initialize(img.Bitmap28);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,78,41);


(lib.Bitmap29 = function() {
	this.initialize(img.Bitmap29);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,76,82);


(lib.Bitmap3 = function() {
	this.initialize(img.Bitmap3);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,565,722);


(lib.Bitmap30 = function() {
	this.initialize(img.Bitmap30);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,90,104);


(lib.Bitmap31 = function() {
	this.initialize(img.Bitmap31);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,48,15);


(lib.Bitmap32 = function() {
	this.initialize(img.Bitmap32);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,90,104);


(lib.Bitmap33 = function() {
	this.initialize(img.Bitmap33);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,409,727);


(lib.Bitmap35 = function() {
	this.initialize(img.Bitmap35);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,4,18);


(lib.Bitmap36 = function() {
	this.initialize(img.Bitmap36);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,12,11);


(lib.Bitmap37 = function() {
	this.initialize(img.Bitmap37);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,90,105);


(lib.Bitmap38 = function() {
	this.initialize(img.Bitmap38);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,90,104);


(lib.Bitmap39 = function() {
	this.initialize(img.Bitmap39);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,84,105);


(lib.Bitmap4 = function() {
	this.initialize(img.Bitmap4);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,493,721);


(lib.Bitmap40 = function() {
	this.initialize(img.Bitmap40);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,76,115);


(lib.Bitmap41 = function() {
	this.initialize(img.Bitmap41);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,4,18);


(lib.Bitmap42 = function() {
	this.initialize(img.Bitmap42);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,12,11);


(lib.Bitmap43 = function() {
	this.initialize(img.Bitmap43);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,13,10);


(lib.Bitmap44 = function() {
	this.initialize(img.Bitmap44);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,4,18);


(lib.Bitmap45 = function() {
	this.initialize(img.Bitmap45);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,8,9);


(lib.Bitmap46 = function() {
	this.initialize(img.Bitmap46);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,4,18);


(lib.Bitmap47 = function() {
	this.initialize(img.Bitmap47);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,78,16);


(lib.Bitmap48 = function() {
	this.initialize(img.Bitmap48);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,22,69);


(lib.Bitmap49 = function() {
	this.initialize(img.Bitmap49);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,22,67);


(lib.Bitmap5 = function() {
	this.initialize(img.Bitmap5);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,405,720);


(lib.Bitmap50 = function() {
	this.initialize(img.Bitmap50);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,61,40);


(lib.Bitmap51 = function() {
	this.initialize(img.Bitmap51);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,405,131);


(lib.Bitmap52 = function() {
	this.initialize(img.Bitmap52);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,2,31);


(lib.Bitmap53 = function() {
	this.initialize(img.Bitmap53);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,76,93);


(lib.Bitmap54 = function() {
	this.initialize(img.Bitmap54);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,95,80);


(lib.Bitmap55 = function() {
	this.initialize(img.Bitmap55);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,76,91);


(lib.Bitmap561 = function() {
	this.initialize(img.Bitmap561);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,35,48);


(lib.Bitmap57 = function() {
	this.initialize(img.Bitmap57);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,13,38);


(lib.Bitmap58 = function() {
	this.initialize(img.Bitmap58);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,76,101);


(lib.Bitmap59 = function() {
	this.initialize(img.Bitmap59);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,62,8);


(lib.Bitmap6 = function() {
	this.initialize(img.Bitmap6);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,109,147);


(lib.Bitmap60 = function() {
	this.initialize(img.Bitmap60);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,20,71);


(lib.Bitmap62 = function() {
	this.initialize(img.Bitmap62);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,78,41);


(lib.Bitmap63 = function() {
	this.initialize(img.Bitmap63);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,30,100);


(lib.Bitmap66 = function() {
	this.initialize(img.Bitmap66);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,17,96);


(lib.Bitmap67 = function() {
	this.initialize(img.Bitmap67);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,78,41);


(lib.Bitmap7 = function() {
	this.initialize(img.Bitmap7);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,107,108);


(lib.Bitmap78 = function() {
	this.initialize(img.Bitmap78);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,24,93);


(lib.Bitmap79 = function() {
	this.initialize(img.Bitmap79);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,29,50);


(lib.Bitmap8 = function() {
	this.initialize(img.Bitmap8);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,26,55);


(lib.Bitmap80 = function() {
	this.initialize(img.Bitmap80);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,88,36);


(lib.Bitmap81 = function() {
	this.initialize(img.Bitmap81);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,24,6);


(lib.Bitmap82 = function() {
	this.initialize(img.Bitmap82);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,87,93);


(lib.Bitmap83 = function() {
	this.initialize(img.Bitmap83);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,85,94);


(lib.Bitmap84 = function() {
	this.initialize(img.Bitmap84);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,76,80);


(lib.Bitmap85 = function() {
	this.initialize(img.Bitmap85);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,76,80);


(lib.Bitmap86 = function() {
	this.initialize(img.Bitmap86);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,43,24);


(lib.Bitmap87 = function() {
	this.initialize(img.Bitmap87);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,12,12);


(lib.Bitmap88 = function() {
	this.initialize(img.Bitmap88);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,116,25);


(lib.Bitmap89 = function() {
	this.initialize(img.Bitmap89);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,138,84);


(lib.Bitmap9 = function() {
	this.initialize(img.Bitmap9);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,17,44);


(lib.Bitmap90 = function() {
	this.initialize(img.Bitmap90);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,154,107);


(lib.Bitmap91 = function() {
	this.initialize(img.Bitmap91);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,155,4);


(lib.Bitmap97 = function() {
	this.initialize(img.Bitmap97);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,23,24);


(lib.Bitmap98 = function() {
	this.initialize(img.Bitmap98);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,24,23);


(lib.Bitmap99 = function() {
	this.initialize(img.Bitmap99);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,23,24);


(lib.recptiek = function() {
	this.initialize(img.recptiek);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,456,598);


(lib.tlacitko = function() {
	this.initialize(img.tlacitko);
}).prototype = p = new cjs.Bitmap();
p.nominalBounds = new cjs.Rectangle(0,0,103,98);


(lib.Ľavedveretween = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap6();
	this.instance.setTransform(-54.4,-73.3);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-54.4,-73.3,109,147);


(lib.Vázaobjcopy = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap111();
	this.instance.setTransform(0,0,0.501,0.501);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,26.1,55.1);


(lib.Vázaobj = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap8();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,26,55);


(lib.vylievané = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap79();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,29,50);


(lib.vybratýmuffinzformy = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap127();
	this.instance.setTransform(0,0,0.501,0.501);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,238.9,56.6);


(lib.Veľkámysatween = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap28();
	this.instance.setTransform(-38.7,-20.6);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-38.7,-20.6,78,41);


(lib.vareška = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap63();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,30,100);


(lib.varechV = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap60();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,20,71);


(lib.Varechaobjcopy = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap112();
	this.instance.setTransform(0,0,0.504,0.505);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,17.2,43.9);


(lib.Varechaobj = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap9();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,17,44);


(lib.Tween144 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#7D7D7D").s().p("AgYh2IAxDAIAAABIgBAKIgEARIgEAIIgBADIgDAGQAHgSgrjbg");
	this.shape.setTransform(19.1,9.6,1.2,1.2,-30);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#7D7D7D").s().p("AAMAuIgFgJIgFAUQgRhKgPgxQAtB2APAPQgKgJgIgMg");
	this.shape_1.setTransform(9.7,28.3,1.2,1.2,-30);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#7D7D7D").s().p("AAAAWQgNg0gQgmIAaA4QAYAzAKARIgFgHQgGAMgMAIQgDgUgFgbg");
	this.shape_2.setTransform(-10.9,39.2,1.2,1.2,-30);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#C8C7C7").s().p("AFxIQQgjgIghgzQgaglgXhTQgbhogSg7IAAABIgBALIgEAQIgEAIIgBADIgIAPIgPAUIgCABIgGAGIgLAIIgBABQgbASgagEQgegEgXgfIgFgKQgJBIhEADQgdABgZgPQgagRgKgdIgGgKQgIAQgSAKQgcATgZgFQghgHgZguQhAhfgcgtIgBAAIgPgYIAAgBQhRiFAgi3QANhLAdg/QAdg9AigdQASgPAegSIAqgYQguAcgMAKQhMBBgZCfQgcCzBRCFIAAABQAgA2AwALQAtALAQgeIAGALQAKAdAYANQAWANAagGQA+gMAIhJIAFAKQAzApA0gWQAdgRAVgfQAVgeABgaIAJg6IAvC6QA6DQAxBgQAtBKAaAOQAUAKAkgTQgaAbgbAAIgMgCg");
	this.shape_3.setTransform(-6.6,8.8,1.2,1.2,-30);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#B5B5B4").s().p("AgGAzQgYgDAYgxIAZgxQgEAKgCA2QAAAlgRAAIgCAAg");
	this.shape_4.setTransform(-47,5,1.2,1.2,-30);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#B5B5B4").s().p("AgNABIANg9QAAAMAOA9QALAtgYADIgBAAQgXAAAKg8g");
	this.shape_5.setTransform(-34,-7.1,1.2,1.2,-30);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#B5B5B4").s().p("AgFAVQgihFgMgKIA/AvQA6AxgbASQgGADgGAAQgTAAgRgmg");
	this.shape_6.setTransform(-20.3,-24.7,1.2,1.2,-30);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#7D7D7D").s().p("AFWIqQgjgOgcgrIgFgHQgOgWgMglIgUhJQgUhQgQgrQgIAdgVAXQgWAYgaAIQgYAHgWgIQgXgIgRgXQgHAYgRAQQgOARgYAFQgeAHgdgMQgegLgPgaQgGgIgEgLIAAgBQgYAhgjAAQgtACgig8IgCgEIgthFIg9hdIAAgBQhUiKAei3QAMhLAdg+QAbg8AhgcQBmhTBZgTQB9gaB9BWQAjAZAtA0QAsAzAlA7IABABQAvBLBNFDQAnCkAgClQAKAtgPAmQgOAlghANQgNAFgPAAQgOAAgQgGgADEDRQAOAhAMAqIATBHQANA1AIAXQAMAlAPAWQAZAnAfANQAbALAXgKQAagKANgeQAPgigJgsQgfibgnimQhOlJguhJIgBgBQgkg6gsgyQgrgzgigYQh4hUh5AaQhWAThiBQQggAbgbA6QgcA9gLBIQgcCzBSCGIAAACIBpCfIAIAOQAcAsAigBQARgBAPgLQAOgKAIgOIAGgLIALAUIAAACQAKAeAdAPQAdAQAfgHQAYgGANgRQAPgSADgbIADgVIAOAcQAgAsArgNQAcgJAWgcQAVgcABgfIACgdg");
	this.shape_7.setTransform(-6.3,5.2,1.2,1.2,-30);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#F7F7F8").s().p("AFXIkQghgOgagpQgXgggXhaQgdhwgUgwQgCA8g3AhQg7Ajgqg8IgGgJQgIBIhEADQgeABgYgQQgagQgKgeIgGgKQgTAkglADQgsAEghg7IhciMIgPgYIAAgBQhSiGAbi0QAYigBMhCQBmhSBagSQB5gYB4BTQAiAYAsAzQAtA0AlA7QAvBLBOFLQAoCnAdCYQAKAsgOAiQgMAggbAOQgOAHgQAAQgOAAgPgGg");
	this.shape_8.setTransform(-6.2,5.2,1.2,1.2,-30);

	this.addChild(this.shape_8,this.shape_7,this.shape_6,this.shape_5,this.shape_4,this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-70.7,-52.1,141.5,104.3);


(lib.Tween140 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap144();
	this.instance.setTransform(-67.2,-67.1);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-67.2,-67.1,134,142);


(lib.Tween139 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap1();
	this.instance.setTransform(-108.6,-198.3);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-108.6,-198.3,217,397);


(lib.Tween135 = function() {
	this.initialize();

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBEDD2").s().p("AgeDxQgzgJgqgeQgpgegcgsIguAUQgFADgEgBQgJAAgBgMIgBjDQAAgKAKgEQAGgDAGACIAFADICQCEQAJAJgGAHQgDADgFACIg1AXQA4BRBhAFQBmAFBAhTQAkguABg9QACg4gdg0Qgig8hEgXQhAgVhCAUQgXAGgFgYQgFgZAXgGQBOgYBKAbQBEAYAuA7QAtA7AFBJQAHBNgqBGQgmBAhJAdQgwAUgyAAQgVAAgXgEg");
	this.shape.setTransform(0.4,0.5,1.614,1.614);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#7B3C6E").s().p("AnEMvQhugfk5huQjxhUh3gSQisgZheBGQAAkyB2kXQBykMDQjQQDQjQEOhyQEXh2EwAAQExAAEXB2QEOByDQDQQDQDQByEMQB2EXAAEyQhehGisAZQh3ASjxBUQk5BuhuAfQj+BGjHAAQjGAAj+hGg");
	this.shape_1.setTransform(0,-29.6,0.477,0.477);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#6F335E").s().p("ApHVoQkOhyjQjQQjQjQhykOQh2kXAAkxQAAkwB2kYQBykNDQjQQDQjQEOhyQEXh2EwAAQExAAEXB2QEOByDQDQQDQDQByENQB2EYAAEwQAAExh2EXQhyEOjQDQQjQDQkOByQkXB2kxAAQkwAAkXh2g");
	this.shape_2.setTransform(0,0.2,0.477,0.477);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FBEDD2").s().p("AphWkQkZh3jZjZQjZjZh3kaQh7kjAAk+QAAk9B7kkQB3kZDZjZQDZjZEZh3QEjh7E+AAQE+AAEkB7QEZB3DZDZQDZDZB3EZQB7EkAAE9QAAE+h7EjQh3EajZDZQjZDZkZB3QkkB7k+AAQk+AAkjh7g");
	this.shape_3.setTransform(0,0,0.477,0.477);

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-74.7,-74.7,149.4,149.4);


(lib.Tween133 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap140();
	this.instance.setTransform(-620.5,-225.6);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-620.5,-225.6,1241,451);


(lib.Tween119 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap136();
	this.instance.setTransform(-25.2,-18.5);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-25.2,-18.5,50,37);


(lib.Tween118 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap135();
	this.instance.setTransform(-12.1,-18.5);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-12.1,-18.5,24,37);


(lib.Tween116 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap133();
	this.instance.setTransform(-26.3,-9.6);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-26.3,-9.6,53,19);


(lib.Tween115 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap132();
	this.instance.setTransform(-3.4,-15);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-3.4,-15,7,30);


(lib.Tween114 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap131();
	this.instance.setTransform(-12.3,-20.7,0.499,0.499);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-12.3,-20.7,24.5,41.5);


(lib.Tween113 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap130();
	this.instance.setTransform(-38,-45.9);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-38,-45.9,76,93);


(lib.Tween112 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap129();
	this.instance.setTransform(-38.1,-43.8);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-38.1,-43.8,76,89);


(lib.Tween111 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap128();
	this.instance.setTransform(-44.3,-39.9);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-44.3,-39.9,89,80);


(lib.Tween110 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap126();
	this.instance.setTransform(-25.6,-17.1,0.498,0.498);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-25.6,-17.1,51.3,34.9);


(lib.Tween108 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap122();
	this.instance.setTransform(-23.4,-4.1);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-23.4,-4.1,47,8);


(lib.Tween107 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap121();
	this.instance.setTransform(-2.3,-31.2);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-2.3,-31.2,5,62);


(lib.Tween106 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap120();
	this.instance.setTransform(-44.6,-26.2,0.5,0.5);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-44.6,-26.2,89.5,52.5);


(lib.Tween105 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap119();
	this.instance.setTransform(-26.1,-45,0.5,0.5);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-26.1,-45,52.5,90);


(lib.Tween104 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap114();
	this.instance.setTransform(-6.4,-8.6,0.494,0.494);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-6.4,-8.6,12.9,16.8);


(lib.Tween103 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap116();
	this.instance.setTransform(-20.7,-14.9,0.501,0.501);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-20.7,-14.9,41.6,30.1);


(lib.Tween101 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap117();
	this.instance.setTransform(-7,-13.8,0.502,0.502);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-7,-13.8,14.1,27.6);


(lib.Tween100 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap115();
	this.instance.setTransform(-13.9,-2.9,0.483,0.483);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-13.9,-2.9,27.1,5.8);


(lib.Tween99 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap108();
	this.instance.setTransform(-42.1,-39.9);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-42.1,-39.9,85,80);


(lib.Tween98 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap106();
	this.instance.setTransform(-38,-41.8);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-38,-41.8,76,83);


(lib.Tween97 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap107();
	this.instance.setTransform(-38,-40.6);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-38,-40.6,76,80);


(lib.Tween95 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap85();
	this.instance.setTransform(-38,-39.9);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-38,-39.9,76,80);


(lib.Tween94 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap84();
	this.instance.setTransform(-38.1,-39.9);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-38.1,-39.9,76,80);


(lib.Tween93 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_23.text = t_lang[chosenL][22][0];
		this.tt_23.font = t_lang[chosenL][22][1];
		this.tt_23.color = t_lang[chosenL][22][2];
		this.tt_23.lineHeight = t_lang[chosenL][22][3];
		this.tt_23.lineWidth = t_lang[chosenL][22][4];
		this.tt_23.maxWidth = t_lang[chosenL][22][5];
		this.tt_23.textAlign = t_lang[chosenL][22][6];
		this.tt_23.textBaseline = t_lang[chosenL][22][7];
		this.tt_23.rotation = t_lang[chosenL][22][8];
		if ((t_lang[chosenL][22][9]) != null && 
			(t_lang[chosenL][22][10]) != null)
		{	
			this.tt_23.x = t_lang[chosenL][22][9];
			this.tt_23.y = t_lang[chosenL][22][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 2
	this.tt_23 = new cjs.Text("45 min.", "bold 15px 'Ubuntu'", "#7C1A50");
	this.tt_23.name = "tt_23";
	this.tt_23.textAlign = "center";
	this.tt_23.lineHeight = 23;
	this.tt_23.lineWidth = 64;
	this.tt_23.setTransform(-1.7,-52.2,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get(this.tt_23).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap1101();
	this.instance.setTransform(-42.7,-46.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-42.7,-52.2,85,99.6);


(lib.Tween91 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap99();
	this.instance.setTransform(-11.7,-11.8);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-11.7,-11.8,23,24);


(lib.Tween90 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap98();
	this.instance.setTransform(-11.8,-11.7);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-11.8,-11.7,24,23);


(lib.Tween89 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap97();
	this.instance.setTransform(-11.7,-11.8);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-11.7,-11.8,23,24);


(lib.Tween88 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_23.text = t_lang[chosenL][22][0];
		this.tt_23.font = t_lang[chosenL][22][1];
		this.tt_23.color = t_lang[chosenL][22][2];
		this.tt_23.lineHeight = t_lang[chosenL][22][3];
		this.tt_23.lineWidth = t_lang[chosenL][22][4];
		this.tt_23.maxWidth = t_lang[chosenL][22][5];
		this.tt_23.textAlign = t_lang[chosenL][22][6];
		this.tt_23.textBaseline = t_lang[chosenL][22][7];
		this.tt_23.rotation = t_lang[chosenL][22][8];
		if ((t_lang[chosenL][22][9]) != null && 
			(t_lang[chosenL][22][10]) != null)
		{	
			this.tt_23.x = t_lang[chosenL][22][9];
			this.tt_23.y = t_lang[chosenL][22][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 2
	this.tt_23 = new cjs.Text("45 min.", "bold 15px 'Ubuntu'", "#7C1A50");
	this.tt_23.name = "tt_23";
	this.tt_23.textAlign = "center";
	this.tt_23.lineHeight = 23;
	this.tt_23.lineWidth = 64;
	this.tt_23.setTransform(-1.7,-52.2,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get(this.tt_23).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap83();
	this.instance.setTransform(-42.8,-46.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-42.8,-52.2,85,99.6);


(lib.Tween87 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_22.text = t_lang[chosenL][21][0];
		this.tt_22.font = t_lang[chosenL][21][1];
		this.tt_22.color = t_lang[chosenL][21][2];
		this.tt_22.lineHeight = t_lang[chosenL][21][3];
		this.tt_22.lineWidth = t_lang[chosenL][21][4];
		this.tt_22.maxWidth = t_lang[chosenL][21][5];
		this.tt_22.textAlign = t_lang[chosenL][21][6];
		this.tt_22.textBaseline = t_lang[chosenL][21][7];
		this.tt_22.rotation = t_lang[chosenL][21][8];
		if ((t_lang[chosenL][21][9]) != null && 
			(t_lang[chosenL][21][10]) != null)
		{	
			this.tt_22.x = t_lang[chosenL][21][9];
			this.tt_22.y = t_lang[chosenL][21][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 2
	this.tt_22 = new cjs.Text("170 °C", "bold 15px 'Ubuntu'", "#7C1A50");
	this.tt_22.name = "tt_22";
	this.tt_22.textAlign = "center";
	this.tt_22.lineHeight = 23;
	this.tt_22.lineWidth = 64;
	this.tt_22.setTransform(-1.7,-52.2,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get(this.tt_22).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap82();
	this.instance.setTransform(-43.7,-46.1);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-43.7,-52.2,87,99.1);


(lib.Tween84 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap55();
	this.instance.setTransform(-38,-45.6);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-38,-45.6,76,91);


(lib.Tween82 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap54();
	this.instance.setTransform(-47.7,-39.9);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-47.7,-39.9,95,80);


(lib.Tween81 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap53();
	this.instance.setTransform(-38.1,-46.6);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-38.1,-46.6,76,93);


(lib.Tween80 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_20.text = t_lang[chosenL][19][0];
		this.tt_20.font = t_lang[chosenL][19][1];
		this.tt_20.color = t_lang[chosenL][19][2];
		this.tt_20.lineHeight = t_lang[chosenL][19][3];
		this.tt_20.lineWidth = t_lang[chosenL][19][4];
		this.tt_20.maxWidth = t_lang[chosenL][19][5];
		this.tt_20.textAlign = t_lang[chosenL][19][6];
		this.tt_20.textBaseline = t_lang[chosenL][19][7];
		this.tt_20.rotation = t_lang[chosenL][19][8];
		if ((t_lang[chosenL][19][9]) != null && 
			(t_lang[chosenL][19][10]) != null)
		{	
			this.tt_20.x = t_lang[chosenL][19][9];
			this.tt_20.y = t_lang[chosenL][19][10];
		}
		
		
		this.tt_21.text = t_lang[chosenL][20][0];
		this.tt_21.font = t_lang[chosenL][20][1];
		this.tt_21.color = t_lang[chosenL][20][2];
		this.tt_21.lineHeight = t_lang[chosenL][20][3];
		this.tt_21.lineWidth = t_lang[chosenL][20][4];
		this.tt_21.maxWidth = t_lang[chosenL][20][5];
		this.tt_21.textAlign = t_lang[chosenL][20][6];
		this.tt_21.textBaseline = t_lang[chosenL][20][7];
		this.tt_21.rotation = t_lang[chosenL][20][8];
		if ((t_lang[chosenL][20][9]) != null && 
			(t_lang[chosenL][20][10]) != null)
		{	
			this.tt_21.x = t_lang[chosenL][20][9];
			this.tt_21.y = t_lang[chosenL][20][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 1
	this.tt_20 = new cjs.Text("MILK", "10px 'Ubuntu Light'", "#402415");
	this.tt_20.name = "tt_20";
	this.tt_20.textAlign = "center";
	this.tt_20.lineHeight = 7;
	this.tt_20.lineWidth = 75;
	this.tt_20.setTransform(6,1.7,1.003,1.003,27);

	this.tt_21 = new cjs.Text("200 ml", "bold 15px 'Ubuntu'", "#7C1A50");
	this.tt_21.name = "tt_21";
	this.tt_21.textAlign = "center";
	this.tt_21.lineHeight = 23;
	this.tt_21.lineWidth = 64;
	this.tt_21.setTransform(-1.1,39.6,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.tt_21},{t:this.tt_20}]}).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap58();
	this.instance.setTransform(-38.1,-42.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-38.1,-42.4,81.1,103);


(lib.Tween79 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_10.text = t_lang[chosenL][9][0];
		this.tt_10.font = t_lang[chosenL][9][1];
		this.tt_10.color = t_lang[chosenL][9][2];
		this.tt_10.lineHeight = t_lang[chosenL][9][3];
		this.tt_10.lineWidth = t_lang[chosenL][9][4];
		this.tt_10.maxWidth = t_lang[chosenL][9][5];
		this.tt_10.textAlign = t_lang[chosenL][9][6];
		this.tt_10.textBaseline = t_lang[chosenL][9][7];
		this.tt_10.rotation = t_lang[chosenL][9][8];
		if ((t_lang[chosenL][9][9]) != null && 
			(t_lang[chosenL][9][10]) != null)
		{	
			this.tt_10.x = t_lang[chosenL][9][9];
			this.tt_10.y = t_lang[chosenL][9][10];
		}
		
		
		this.tt_11.text = t_lang[chosenL][10][0];
		this.tt_11.font = t_lang[chosenL][10][1];
		this.tt_11.color = t_lang[chosenL][10][2];
		this.tt_11.lineHeight = t_lang[chosenL][10][3];
		this.tt_11.lineWidth = t_lang[chosenL][10][4];
		this.tt_11.maxWidth = t_lang[chosenL][10][5];
		this.tt_11.textAlign = t_lang[chosenL][10][6];
		this.tt_11.textBaseline = t_lang[chosenL][10][7];
		this.tt_11.rotation = t_lang[chosenL][10][8];
		if ((t_lang[chosenL][10][9]) != null && 
			(t_lang[chosenL][10][10]) != null)
		{	
			this.tt_11.x = t_lang[chosenL][10][9];
			this.tt_11.y = t_lang[chosenL][10][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 1
	this.tt_11 = new cjs.Text("90 g", "bold 15px 'Ubuntu'", "#7C1A50");
	this.tt_11.name = "tt_11";
	this.tt_11.textAlign = "center";
	this.tt_11.lineHeight = 23;
	this.tt_11.lineWidth = 64;
	this.tt_11.setTransform(-0.7,41.3,1.003,1.003);

	this.tt_10 = new cjs.Text("SUGAR", "14px 'Ubuntu Light'", "#402415");
	this.tt_10.name = "tt_10";
	this.tt_10.textAlign = "center";
	this.tt_10.lineHeight = 22;
	this.tt_10.lineWidth = 64;
	this.tt_10.setTransform(-0.7,6.5,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.tt_10},{t:this.tt_11}]}).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap30();
	this.instance.setTransform(-44.8,-39.9);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-44.8,-39.9,90,104);


(lib.Tween76 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_18.text = t_lang[chosenL][17][0];
		this.tt_18.font = t_lang[chosenL][17][1];
		this.tt_18.color = t_lang[chosenL][17][2];
		this.tt_18.lineHeight = t_lang[chosenL][17][3];
		this.tt_18.lineWidth = t_lang[chosenL][17][4];
		this.tt_18.maxWidth = t_lang[chosenL][17][5];
		this.tt_18.textAlign = t_lang[chosenL][17][6];
		this.tt_18.textBaseline = t_lang[chosenL][17][7];
		this.tt_18.rotation = t_lang[chosenL][17][8];
		if ((t_lang[chosenL][17][9]) != null && 
			(t_lang[chosenL][17][10]) != null)
		{	
			this.tt_18.x = t_lang[chosenL][17][9];
			this.tt_18.y = t_lang[chosenL][17][10];
		}
		
		
		this.tt_19.text = t_lang[chosenL][18][0];
		this.tt_19.font = t_lang[chosenL][18][1];
		this.tt_19.color = t_lang[chosenL][18][2];
		this.tt_19.lineHeight = t_lang[chosenL][18][3];
		this.tt_19.lineWidth = t_lang[chosenL][18][4];
		this.tt_19.maxWidth = t_lang[chosenL][18][5];
		this.tt_19.textAlign = t_lang[chosenL][18][6];
		this.tt_19.textBaseline = t_lang[chosenL][18][7];
		this.tt_19.rotation = t_lang[chosenL][18][8];
		if ((t_lang[chosenL][18][9]) != null && 
			(t_lang[chosenL][18][10]) != null)
		{	
			this.tt_19.x = t_lang[chosenL][18][9];
			this.tt_19.y = t_lang[chosenL][18][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 1
	this.tt_18 = new cjs.Text("OIL", "10px 'Ubuntu Light'", "#402415");
	this.tt_18.name = "tt_18";
	this.tt_18.textAlign = "center";
	this.tt_18.lineHeight = 7;
	this.tt_18.lineWidth = 64;
	this.tt_18.setTransform(2.3,12.3,1.003,1.003);

	this.tt_19 = new cjs.Text("60 ml", "bold 15px 'Ubuntu'", "#7C1A50");
	this.tt_19.name = "tt_19";
	this.tt_19.textAlign = "center";
	this.tt_19.lineHeight = 23;
	this.tt_19.lineWidth = 64;
	this.tt_19.setTransform(-1.7,45.8,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.tt_19},{t:this.tt_18}]}).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap40();
	this.instance.setTransform(-38,-49.3);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-38,-49.3,76.4,116);


(lib.Tween75 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_14.text = t_lang[chosenL][13][0];
		this.tt_14.font = t_lang[chosenL][13][1];
		this.tt_14.color = t_lang[chosenL][13][2];
		this.tt_14.lineHeight = t_lang[chosenL][13][3];
		this.tt_14.lineWidth = t_lang[chosenL][13][4];
		this.tt_14.maxWidth = t_lang[chosenL][13][5];
		this.tt_14.textAlign = t_lang[chosenL][13][6];
		this.tt_14.textBaseline = t_lang[chosenL][13][7];
		this.tt_14.rotation = t_lang[chosenL][13][8];
		if ((t_lang[chosenL][13][9]) != null && 
			(t_lang[chosenL][13][10]) != null)
		{	
			this.tt_14.x = t_lang[chosenL][13][9];
			this.tt_14.y = t_lang[chosenL][13][10];
		}
		
		
		this.tt_15.text = t_lang[chosenL][14][0];
		this.tt_15.font = t_lang[chosenL][14][1];
		this.tt_15.color = t_lang[chosenL][14][2];
		this.tt_15.lineHeight = t_lang[chosenL][14][3];
		this.tt_15.lineWidth = t_lang[chosenL][14][4];
		this.tt_15.maxWidth = t_lang[chosenL][14][5];
		this.tt_15.textAlign = t_lang[chosenL][14][6];
		this.tt_15.textBaseline = t_lang[chosenL][14][7];
		this.tt_15.rotation = t_lang[chosenL][14][8];
		if ((t_lang[chosenL][14][9]) != null && 
			(t_lang[chosenL][14][10]) != null)
		{	
			this.tt_15.x = t_lang[chosenL][14][9];
			this.tt_15.y = t_lang[chosenL][14][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 1
	this.tt_14 = new cjs.Text("FLOUR", "14px 'Ubuntu Light'", "#402415");
	this.tt_14.name = "tt_14";
	this.tt_14.textAlign = "center";
	this.tt_14.lineHeight = 22;
	this.tt_14.lineWidth = 64;
	this.tt_14.setTransform(-0.7,6,1.003,1.003);

	this.tt_15 = new cjs.Text("300 g", "bold 15px 'Ubuntu'", "#7C1A50");
	this.tt_15.name = "tt_15";
	this.tt_15.textAlign = "center";
	this.tt_15.lineHeight = 23;
	this.tt_15.lineWidth = 64;
	this.tt_15.setTransform(-0.7,41.3,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.tt_15},{t:this.tt_14}]}).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap38();
	this.instance.setTransform(-44.8,-39.9);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-44.8,-39.9,90,104);


(lib.Tween73 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_12.text = t_lang[chosenL][11][0];
		this.tt_12.font = t_lang[chosenL][11][1];
		this.tt_12.color = t_lang[chosenL][11][2];
		this.tt_12.lineHeight = t_lang[chosenL][11][3];
		this.tt_12.lineWidth = t_lang[chosenL][11][4];
		this.tt_12.maxWidth = t_lang[chosenL][11][5];
		this.tt_12.textAlign = t_lang[chosenL][11][6];
		this.tt_12.textBaseline = t_lang[chosenL][11][7];
		this.tt_12.rotation = t_lang[chosenL][11][8];
		if ((t_lang[chosenL][11][9]) != null && 
			(t_lang[chosenL][11][10]) != null)
		{	
			this.tt_12.x = t_lang[chosenL][11][9];
			this.tt_12.y = t_lang[chosenL][11][10];
		}
		
		
		this.tt_13.text = t_lang[chosenL][12][0];
		this.tt_13.font = t_lang[chosenL][12][1];
		this.tt_13.color = t_lang[chosenL][12][2];
		this.tt_13.lineHeight = t_lang[chosenL][12][3];
		this.tt_13.lineWidth = t_lang[chosenL][12][4];
		this.tt_13.maxWidth = t_lang[chosenL][12][5];
		this.tt_13.textAlign = t_lang[chosenL][12][6];
		this.tt_13.textBaseline = t_lang[chosenL][12][7];
		this.tt_13.rotation = t_lang[chosenL][12][8];
		if ((t_lang[chosenL][12][9]) != null && 
			(t_lang[chosenL][12][10]) != null)
		{	
			this.tt_13.x = t_lang[chosenL][12][9];
			this.tt_13.y = t_lang[chosenL][12][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 1
	this.tt_13 = new cjs.Text("10 g", "bold 15px 'Ubuntu'", "#7C1A50");
	this.tt_13.name = "tt_13";
	this.tt_13.textAlign = "center";
	this.tt_13.lineHeight = 23;
	this.tt_13.lineWidth = 64;
	this.tt_13.setTransform(-0.7,41.3,1.003,1.003);

	this.tt_12 = new cjs.Text("BAKING\nPOWDER", "10px 'Ubuntu Light'", "#402415");
	this.tt_12.name = "tt_12";
	this.tt_12.textAlign = "center";
	this.tt_12.lineHeight = 7;
	this.tt_12.lineWidth = 64;
	this.tt_12.setTransform(0,5.8,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.tt_12},{t:this.tt_13}]}).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap37();
	this.instance.setTransform(-44.8,-39.9);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-44.8,-39.9,90,105);


(lib.Tween72 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_16.text = t_lang[chosenL][15][0];
		this.tt_16.font = t_lang[chosenL][15][1];
		this.tt_16.color = t_lang[chosenL][15][2];
		this.tt_16.lineHeight = t_lang[chosenL][15][3];
		this.tt_16.lineWidth = t_lang[chosenL][15][4];
		this.tt_16.maxWidth = t_lang[chosenL][15][5];
		this.tt_16.textAlign = t_lang[chosenL][15][6];
		this.tt_16.textBaseline = t_lang[chosenL][15][7];
		this.tt_16.rotation = t_lang[chosenL][15][8];
		if ((t_lang[chosenL][15][9]) != null && 
			(t_lang[chosenL][15][10]) != null)
		{	
			this.tt_16.x = t_lang[chosenL][15][9];
			this.tt_16.y = t_lang[chosenL][15][10];
		}
		
		
		this.tt_17.text = t_lang[chosenL][16][0];
		this.tt_17.font = t_lang[chosenL][16][1];
		this.tt_17.color = t_lang[chosenL][16][2];
		this.tt_17.lineHeight = t_lang[chosenL][16][3];
		this.tt_17.lineWidth = t_lang[chosenL][16][4];
		this.tt_17.maxWidth = t_lang[chosenL][16][5];
		this.tt_17.textAlign = t_lang[chosenL][16][6];
		this.tt_17.textBaseline = t_lang[chosenL][16][7];
		this.tt_17.rotation = t_lang[chosenL][16][8];
		if ((t_lang[chosenL][16][9]) != null && 
			(t_lang[chosenL][16][10]) != null)
		{	
			this.tt_17.x = t_lang[chosenL][16][9];
			this.tt_17.y = t_lang[chosenL][16][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 1
	this.tt_17 = new cjs.Text("5 g", "bold 15px 'Ubuntu'", "#7C1A50");
	this.tt_17.name = "tt_17";
	this.tt_17.textAlign = "center";
	this.tt_17.lineHeight = 23;
	this.tt_17.lineWidth = 64;
	this.tt_17.setTransform(-0.7,41.3,1.003,1.003);

	this.tt_16 = new cjs.Text("SALT", "14px 'Ubuntu Light'", "#FFFFFF");
	this.tt_16.name = "tt_16";
	this.tt_16.textAlign = "center";
	this.tt_16.lineHeight = 22;
	this.tt_16.lineWidth = 64;
	this.tt_16.setTransform(-2,11.6,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.tt_16},{t:this.tt_17}]}).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap39();
	this.instance.setTransform(-41.8,-39.9);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-41.8,-39.9,84,105);


(lib.Tween67 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap66();
	this.instance.setTransform(-8.2,-47.8);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-8.2,-47.8,17,96);


(lib.Tween66 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#BF964C").s().p("Ak2AOQAWgOBQgQQBjgUBxAAQBwAABeATQBLAPAaAOQgvAMhRAGQhUAHhjAAQjMAAhqgXg");

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-31.1,-3.7,62.3,7.6);


(lib.Tween65 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBD894").s().p("AhKAPQCagNg4gIIhVgHQCTgDgLAOQgGAFgjAHQgQAFgvAAg");
	this.shape.setTransform(8.3,0.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFF5D6").s().p("Aj2ABIgJgBIATgGQAGANB/AGQClAIBbgLQAugFALgFQAKgGgWgEQgsgJicAJIgDADQADACAfgBQA2gDg0AHIgyABQgvgBASgIQAhgNCAgCQCMgCACAbQgHgFgOgCQgWAQhHAKQgwAHg+AAQhzAAiigZg");
	this.shape_1.setTransform(-2.6,0.3);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FBD894").s().p("AjEgJQASgHASgEQBeArEHgJQg+AHhHAAQiZAAhrgeg");
	this.shape_2.setTransform(-8.7,1.3);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#BF964C").s().p("Ak2AOQAWgOBQgQQBjgUBxAAQBwAABeATQBLAPAaAOQgvAMhRAGQhUAHhjAAQjMAAhqgXg");

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-31.1,-3.7,62.3,7.6);


(lib.Tween64 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBD894").s().p("AhKAPQCagNg4gIIhVgHQCTgDgLAOQgGAFgjAHQgQAFgvAAg");
	this.shape.setTransform(8.3,0.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFF5D6").s().p("Aj2ABIgJgBIATgGQAGANB/AGQClAIBbgLQAugFALgFQAKgGgWgEQgsgJicAJIgDADQADACAfgBQA2gDg0AHIgyABQgvgBASgIQAhgNCAgCQCMgCACAbQgHgFgOgCQgWAQhHAKQgwAHg+AAQhzAAiigZg");
	this.shape_1.setTransform(-2.6,0.3);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FBD894").s().p("AjEgJQASgHASgEQBeArEHgJQg+AHhHAAQiZAAhrgeg");
	this.shape_2.setTransform(-8.7,1.3);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#BF964C").s().p("Ak2AOQAWgOBQgQQBjgUBxAAQBwAABeATQBLAPAaAOQgvAMhRAGQhUAHhjAAQjMAAhqgXg");

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-31.1,-3.7,62.3,7.6);


(lib.Tween63 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBD894").s().p("AhJADQAFgFAjgHQAagHBSACQiaAOA4AIQAaAFA7ACIguAAQhiAAAJgMg");
	this.shape.setTransform(-10.1,-0.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFF5D6").s().p("ADeAKQAhgUihgHQilgIhbAKQgtAFgNAHIgCADQABADAOACQAsAJCegJQABAAABgBQABAAAAAAQABgBAAAAQAAgBgBAAQgDgCgiABQghACAMgDIAUgBIAxAAQAwABgTAFQggANiAACQiNACgCgaIAGADQAIACAIABQAWgQBGgKQCOgUD1AnIAWAGQARALgWAJQgvAHg9AEQA6gKATgMg");
	this.shape_1.setTransform(1.8,0);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FBD894").s().p("ABJgGQhngWi8AGQBCgHBCAAQBuAABfATQBLANAZARQgTAFgkAFQgXgXhEgNg");
	this.shape_2.setTransform(9.2,-0.7);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#BF964C").s().p("Ak2AOQAWgOBQgQQBjgVBxAAQBvABBfASQBLAQAaAPQgvALhRAHQhUAGhjAAQjJAAhtgXg");

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-31.1,-3.8,62.3,7.6);


(lib.Tween62 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBD894").s().p("AhKAPQCagNg4gIIhVgHQCTgDgLAOQgGAFgjAHQgQAFgvAAg");
	this.shape.setTransform(8.3,0.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFF5D6").s().p("Aj2ABIgJgBIATgGQAGANB/AGQClAIBbgLQAugFALgFQAKgGgWgEQgsgJicAJIgDADQADACAfgBQA2gDg0AHIgyABQgvgBASgIQAhgNCAgCQCMgCACAbQgHgFgOgCQgWAQhHAKQgwAHg+AAQhzAAiigZg");
	this.shape_1.setTransform(-2.6,0.3);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FBD894").s().p("AjEgJQASgHASgEQBeArEHgJQg+AHhHAAQiZAAhrgeg");
	this.shape_2.setTransform(-8.7,1.3);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#BF964C").s().p("Ak2AOQAWgOBQgQQBjgUBxAAQBwAABeATQBLAPAaAOQgvAMhRAGQhUAHhjAAQjMAAhqgXg");

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-31.1,-3.7,62.3,7.6);


(lib.Tween61 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBD894").s().p("AhJADQAFgFAjgHQAagHBSACQiaAOA4AIQAaAFA7ACIguAAQhiAAAJgMg");
	this.shape.setTransform(-10.1,-0.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFF5D6").s().p("ADeAKQAhgUihgHQilgIhbAKQgtAFgNAHIgCADQABADAOACQAsAJCegJQABAAABgBQABAAAAAAQABgBAAAAQAAgBgBAAQgDgCgiABQghACAMgDIAUgBIAxAAQAwABgTAFQggANiAACQiNACgCgaIAGADQAIACAIABQAWgQBGgKQCOgUD1AnIAWAGQARALgWAJQgvAHg9AEQA6gKATgMg");
	this.shape_1.setTransform(1.8,0);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FBD894").s().p("ABJgGQhngWi8AGQBCgHBCAAQBuAABfATQBLANAZARQgTAFgkAFQgXgXhEgNg");
	this.shape_2.setTransform(9.2,-0.7);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#BF964C").s().p("Ak2AOQAWgOBQgQQBjgVBxAAQBvABBfASQBLAQAaAPQgvALhRAHQhUAGhjAAQjJAAhtgXg");

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-31.1,-3.8,62.3,7.6);


(lib.Tween60 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBD894").s().p("AhKAPQCagNg4gIIhVgHQCTgDgLAOQgGAFgjAHQgQAFgvAAg");
	this.shape.setTransform(8.3,0.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFF5D6").s().p("Aj2ABIgJgBIATgGQAGANB/AGQClAIBbgLQAugFALgFQAKgGgWgEQgsgJicAJIgDADQADACAfgBQA2gDg0AHIgyABQgvgBASgIQAhgNCAgCQCMgCACAbQgHgFgOgCQgWAQhHAKQgwAHg+AAQhzAAiigZg");
	this.shape_1.setTransform(-2.6,0.3);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FBD894").s().p("AjEgJQASgHASgEQBeArEHgJQg+AHhHAAQiZAAhrgeg");
	this.shape_2.setTransform(-8.7,1.3);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#BF964C").s().p("Ak2AOQAWgOBQgQQBjgUBxAAQBwAABeATQBLAPAaAOQgvAMhRAGQhUAHhjAAQjMAAhqgXg");

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-31.1,-3.7,62.3,7.6);


(lib.Tween59 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBD894").s().p("AhJADQAFgFAjgHQAagHBSACQiaAOA4AIQAaAFA7ACIguAAQhiAAAJgMg");
	this.shape.setTransform(-10.1,-0.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFF5D6").s().p("ADeAKQAhgUihgHQilgIhbAKQgtAFgNAHIgCADQABADAOACQAsAJCegJQABAAABgBQABAAAAAAQABgBAAAAQAAgBgBAAQgDgCgiABQghACAMgDIAUgBIAxAAQAwABgTAFQggANiAACQiNACgCgaIAGADQAIACAIABQAWgQBGgKQCOgUD1AnIAWAGQARALgWAJQgvAHg9AEQA6gKATgMg");
	this.shape_1.setTransform(1.8,0);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FBD894").s().p("ABJgGQhngWi8AGQBCgHBCAAQBuAABfATQBLANAZARQgTAFgkAFQgXgXhEgNg");
	this.shape_2.setTransform(9.2,-0.7);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#BF964C").s().p("Ak2AOQAWgOBQgQQBjgVBxAAQBvABBfASQBLAQAaAPQgvALhRAHQhUAGhjAAQjJAAhtgXg");

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-31.1,-3.8,62.3,7.6);


(lib.Tween58 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBD894").s().p("AhKAPQCagNg4gIIhVgHQCTgDgLAOQgGAFgjAHQgQAFgvAAg");
	this.shape.setTransform(8.3,0.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFF5D6").s().p("Aj2ABIgJgBIATgGQAGANB/AGQClAIBbgLQAugFALgFQAKgGgWgEQgsgJicAJIgDADQADACAfgBQA2gDg0AHIgyABQgvgBASgIQAhgNCAgCQCMgCACAbQgHgFgOgCQgWAQhHAKQgwAHg+AAQhzAAiigZg");
	this.shape_1.setTransform(-2.6,0.3);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FBD894").s().p("AjEgJQASgHASgEQBeArEHgJQg+AHhHAAQiZAAhrgeg");
	this.shape_2.setTransform(-8.7,1.3);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#BF964C").s().p("Ak2AOQAWgOBQgQQBjgUBxAAQBwAABeATQBLAPAaAOQgvAMhRAGQhUAHhjAAQjMAAhqgXg");

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-31.1,-3.7,62.3,7.6);


(lib.Tween57 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBD894").s().p("AhJADQAFgFAjgHQAagHBSACQiaAOA4AIQAaAFA7ACIguAAQhiAAAJgMg");
	this.shape.setTransform(-10.1,-0.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFF5D6").s().p("ADeAKQAhgUihgHQilgIhbAKQgtAFgNAHIgCADQABADAOACQAsAJCegJQABAAABgBQABAAAAAAQABgBAAAAQAAgBgBAAQgDgCgiABQghACAMgDIAUgBIAxAAQAwABgTAFQggANiAACQiNACgCgaIAGADQAIACAIABQAWgQBGgKQCOgUD1AnIAWAGQARALgWAJQgvAHg9AEQA6gKATgMg");
	this.shape_1.setTransform(1.8,0);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FBD894").s().p("ABJgGQhngWi8AGQBCgHBCAAQBuAABfATQBLANAZARQgTAFgkAFQgXgXhEgNg");
	this.shape_2.setTransform(9.2,-0.7);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#BF964C").s().p("Ak2AOQAWgOBQgQQBjgVBxAAQBvABBfASQBLAQAaAPQgvALhRAHQhUAGhjAAQjJAAhtgXg");

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-31.1,-3.8,62.3,7.6);


(lib.Tween56 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBD894").s().p("ABjAMQgPgLgWgEQgzgNh5gJIAiAAQBoAHBIAUIAKAHIABAFQAAAGgJAGQAFgHgIgHg");
	this.shape.setTransform(16.4,-0.8);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FBD894").s().p("AgGgEIgYgIQBMAFgSAKIgfAKQAQgIgTgJg");
	this.shape_1.setTransform(15.3,0.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FFF3D3").s().p("ABjAcQApgJAGgIQAMgNgfgIQgUgFg4gGQhJgHgrAHQABAGgLAFQgUAKg2gDQg4gEAIgLQAGgJAbgEQA2gFBgACQB7AEAyAUQAwARgKAQQg5AIhaAEQAZgDAYgEg");
	this.shape_2.setTransform(5.9,0);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#BF964C").s().p("Ak2AOQAWgOBQgQQBjgVBxAAQBvABBfASQBLAQAaAPQgvALhRAHQhUAGhjAAQjJAAhtgXg");

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-31.1,-3.8,62.3,7.6);


(lib.Tween55 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFF3D3").s().p("AAYAFQgEgFgdAAQglAAgVgGIgOgHQB1gCAiAIQARAEgHADIgWAIIgvAGQARgEgEgFg");
	this.shape.setTransform(20.1,1.4);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFF3D3").s().p("AgzAZQhWgDhEgJQgPgJgHgNQAbgJAmgIQALAIAHARQAKAXCfACIDLgDQg4AEhFACg");
	this.shape_1.setTransform(-4.9,1);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FBD894").s().p("AAKASIhogDQhFgVAqgIQAVgDAjABQgrAEAPAGQAHADAQACIDQAPQgPAEhPAAIgiAAg");
	this.shape_2.setTransform(-0.1,1.8);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#BF964C").s().p("Ak2AOQAWgOBQgQQBjgUBxAAQBwAABeATQBLAPAaAOQgvAMhRAGQhUAHhjAAQjMAAhqgXg");

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-31.1,-3.7,62.3,7.6);


(lib.Tween49 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap29();
	this.instance.setTransform(-38.2,-40.4);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-38.2,-40.4,76,82);


(lib.Tween47 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap27();
	this.instance.setTransform(-41.9,-39.9);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-41.9,-39.9,84,80);


(lib.Tween45 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_9.text = t_lang[chosenL][8][0];
		this.tt_9.font = t_lang[chosenL][8][1];
		this.tt_9.color = t_lang[chosenL][8][2];
		this.tt_9.lineHeight = t_lang[chosenL][8][3];
		this.tt_9.lineWidth = t_lang[chosenL][8][4];
		this.tt_9.maxWidth = t_lang[chosenL][8][5];
		this.tt_9.textAlign = t_lang[chosenL][8][6];
		this.tt_9.textBaseline = t_lang[chosenL][8][7];
		this.tt_9.rotation = t_lang[chosenL][8][8];
		if ((t_lang[chosenL][8][9]) != null && 
			(t_lang[chosenL][8][10]) != null)
		{	
			this.tt_9.x = t_lang[chosenL][8][9];
			this.tt_9.y = t_lang[chosenL][8][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 2
	this.tt_9 = new cjs.Text("SALT", "14px 'Ubuntu Light'", "#FFFFFF");
	this.tt_9.name = "tt_9";
	this.tt_9.textAlign = "center";
	this.tt_9.lineHeight = 22;
	this.tt_9.lineWidth = 64;
	this.tt_9.setTransform(-2.6,7.3,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get(this.tt_9).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap24();
	this.instance.setTransform(-44,-39.9);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-44,-39.9,88,80);


(lib.Tween42 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap20();
	this.instance.setTransform(-44.2,-48);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-44.2,-48,87,96);


(lib.Tween40 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap19();
	this.instance.setTransform(-46.9,-39.9);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-46.9,-39.9,94,80);


(lib.Tween37 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap17();
	this.instance.setTransform(-47,-39.9);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-47,-39.9,94,80);


(lib.Tween32 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap15();
	this.instance.setTransform(-38,-41);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-38,-41,76,82);


(lib.Tween27copy = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap125();
	this.instance.setTransform(-58.1,-14,0.5,0.5);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-58.1,-14,116.5,28);


(lib.Tween27 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap109();
	this.instance.setTransform(-58.1,-14);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-58.1,-14,116,28);


(lib.Tween25 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap100();
	this.instance.setTransform(-52.9,-12.7);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-52.9,-12.7,106,26);


(lib.Tween24 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap91();
	this.instance.setTransform(-77.4,-1.9);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-77.4,-1.9,155,4);


(lib.Tween11copy2 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap118();
	this.instance.setTransform(-12.7,-22.4,0.501,0.501);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-12.7,-22.4,25.6,45.1);


(lib.Tween11 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap101();
	this.instance.setTransform(-12.7,-22.4);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-12.7,-22.4,26,45);


(lib.Tween10copy = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap123();
	this.instance.setTransform(-29.1,-5.1,0.491,0.49);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-29.1,-5.1,57.4,10.3);


(lib.Tween10 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap102();
	this.instance.setTransform(-29.1,-5.1);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-29.1,-5.1,58,10);


(lib.Tween9 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap88();
	this.instance.setTransform(-58.1,-12.5);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-58.1,-12.5,116,25);


(lib.Tween8 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap59();
	this.instance.setTransform(-31.1,-3.8);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-31.1,-3.8,62,8);


(lib.Tween7 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap57();
	this.instance.setTransform(-6.6,-18.8);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-6.6,-18.8,13,38);


(lib.Tween6 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap52();
	this.instance.setTransform(-1.1,-15.2);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-1.1,-15.2,2,31);


(lib.Tween5 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap50();
	this.instance.setTransform(-30.3,-20.1);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-30.3,-20.1,61,40);


(lib.Tween4 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap49();
	this.instance.setTransform(-10.8,-33.4);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-10.8,-33.4,22,67);


(lib.Tween3 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap47();
	this.instance.setTransform(-38.7,-8.1);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-38.7,-8.1,78,16);


(lib.Tween1copy2 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap137();
	this.instance.setTransform(-16.2,-14.9,0.498,0.498);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-16.2,-14.9,32.4,29.9);


(lib.Tween1 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap23();
	this.instance.setTransform(-16.2,-14.9);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-16.2,-14.9,32,30);


(lib.trademark_symbol2 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#E95631").ss(2,1,1).p("ABuAAQAAAuggAgQghAggtAAQgsAAghggQggggAAguQAAgsAgggQAhghAsAAQAtAAAhAhQAgAgAAAsg");
	this.shape.setTransform(11,11);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#E95631").s().p("AA4AmQgCgCAAgDIAAgsIgSAVQgCADgDAAQgEAAgCgDIgSgVIAAAsQAAADgCACQAAAAgBABQAAAAgBAAQAAAAgBAAQgBABAAAAQgCAAgCgCQgBgCAAgDIAAhBQAAgCABgDQACgBACAAQADAAABACIAaAhIAZghQABgCADAAQABAAABAAQABAAAAAAQABAAAAAAQABABAAAAQADADgBACIAABBQABADgDACQAAAAgBABQAAAAgBAAQAAAAgBAAQgBABgBAAQgCAAgCgCgAgtAmQgBgCgBgDIAAg7IgMAAQgDABgDgCQAAgBgBAAQAAgBAAAAQAAgBAAAAQAAgBgBgBQABgCABgDQADgBADAAIAnAAQABAAABAAQAAAAABAAQAAAAABAAQAAABABAAQABADABACQAAABgBABQAAAAAAABQAAAAAAABQgBAAAAABQgBAAAAABQgBAAAAAAQgBAAAAAAQgBAAgBAAIgNAAIAAA7QAAADgCACQAAAAgBABQgBAAAAAAQgBAAAAAAQgBABgBAAQgCAAgDgCg");
	this.shape_1.setTransform(10.4,10.9);

	this.addChild(this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-1,-1,24,24);


(lib.l1b4 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(255,255,255,0)").s().p("AoAHsIAAvXIQBAAIAAPXg");
	this.shape.setTransform(33.4,33);

	this.instance = new lib.tlacitko();
	this.instance.setTransform(-18,-16.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape}]}).to({state:[{t:this.instance}]},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-18,-16.2,102.7,98.4);


(lib.Taniernastôl = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap21();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,75,13);


(lib.Symbol2 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap33();
	this.instance.setTransform(-14.8,-123.3);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-14.8,-123.3,409,727);


(lib.Sugartween = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_5.text = t_lang[chosenL][4][0];
		this.tt_5.font = t_lang[chosenL][4][1];
		this.tt_5.color = t_lang[chosenL][4][2];
		this.tt_5.lineHeight = t_lang[chosenL][4][3];
		this.tt_5.lineWidth = t_lang[chosenL][4][4];
		this.tt_5.maxWidth = t_lang[chosenL][4][5];
		this.tt_5.textAlign = t_lang[chosenL][4][6];
		this.tt_5.textBaseline = t_lang[chosenL][4][7];
		this.tt_5.rotation = t_lang[chosenL][4][8];
		if ((t_lang[chosenL][4][9]) != null && 
			(t_lang[chosenL][4][10]) != null)
		{	
			this.tt_5.x = t_lang[chosenL][4][9];
			this.tt_5.y = t_lang[chosenL][4][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 2
	this.tt_5 = new cjs.Text("SUGAR", "14px 'Ubuntu Light'", "#402415");
	this.tt_5.name = "tt_5";
	this.tt_5.textAlign = "center";
	this.tt_5.lineHeight = 22;
	this.tt_5.lineWidth = 64;
	this.tt_5.setTransform(-0.7,-7,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get(this.tt_5).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap12();
	this.instance.setTransform(-44.8,-16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-44.8,-16,90,32);


(lib.strúhanámrkva = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap86();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,43,24);


(lib.struhadlonastôl = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap16();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,33,63);


(lib.statikmiešanica = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#BF964C").s().p("Ah4ADQAOgIAugNQBygCArAFQBDAHh2AUIgoAIQhLgGgzgLg");
	this.shape.setTransform(12.1,4.9);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFF3D4").s().p("AkKAHQALgHAhgJQAmgLAygIQCsgEA/AFQBYAHinAUQiwAYCCACQBYACDLgIQhnALh5AAQjJAAhsgYg");
	this.shape_1.setTransform(26.7,4.4);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#F7D48F").s().p("AhNAJQAGgHBVgNQAhAHAfAIQhhAIglAAQgYAAADgDg");
	this.shape_2.setTransform(51.9,3.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#BF964C").s().p("Ak2AOQAWgPBQgQQBjgTBxgBQBwABBfASQBLAQAYAPQguAKhRAIQhVAGhiAAQjKABhsgYg");
	this.shape_3.setTransform(31.1,3.8);

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,62.2,7.6);


(lib.soľmyskatween = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap26();
	this.instance.setTransform(-17,-6);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-17,-6,34,12);


(lib.Soľtween = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap25();
	this.instance.setTransform(-14.5,-5.6);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-14.5,-5.6,29,11);


(lib.Soĺnaližičke = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap45();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,8,9);


(lib.scórebackgroun = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{startF:0,animF:1,endF:84});

	// timeline functions:
	this.frame_0 = function() {
		//this.stop();
		playSound("gong");
	}
	this.frame_12 = function() {
		playSound("potlesk");
	}
	this.frame_84 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(12).call(this.frame_12).wait(72).call(this.frame_84).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap138();
	this.instance.setTransform(-243.3,-399.9);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(85));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-243.3,-399.9,876,715);


(lib.score_symbol = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_8.text = t_lang[chosenL][7][0];
		this.tt_8.font = t_lang[chosenL][7][1];
		this.tt_8.color = t_lang[chosenL][7][2];
		this.tt_8.lineHeight = t_lang[chosenL][7][3];
		this.tt_8.lineWidth = t_lang[chosenL][7][4];
		this.tt_8.maxWidth = t_lang[chosenL][7][5];
		this.tt_8.textAlign = t_lang[chosenL][7][6];
		this.tt_8.textBaseline = t_lang[chosenL][7][7];
		this.tt_8.rotation = t_lang[chosenL][7][8];
		if ((t_lang[chosenL][7][9]) != null && 
			(t_lang[chosenL][7][10]) != null)
		{	
			this.tt_8.x = t_lang[chosenL][7][9];
			this.tt_8.y = t_lang[chosenL][7][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 3
	this.tt_8 = new cjs.Text("TIME", "25px 'Rancho'", "#FBEDD2");
	this.tt_8.name = "tt_8";
	this.tt_8.textAlign = "center";
	this.tt_8.lineHeight = 33;
	this.tt_8.lineWidth = 127;
	this.tt_8.setTransform(74.5,7.9,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get(this.tt_8).wait(1));

	// Layer 1
	this.score = new cjs.Text("1000", "45px 'Rancho'", "#FBEDD2");
	this.score.name = "score";
	this.score.textAlign = "center";
	this.score.lineHeight = 47;
	this.score.lineWidth = 89;
	this.score.setTransform(74,30);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#7B3C6E").s().p("AnEMvQhugfk5huQjxhUh3gSQisgZheBGQAAkyB2kXQBykMDQjQQDQjQEOhyQEXh2EwAAQExAAEXB2QEOByDQDQQDQDQByEMQB2EXAAEyQhehGisAZQh3ASjxBUQk5BuhuAfQj+BGjHAAQjGAAj+hGg");
	this.shape.setTransform(74.7,45.1,0.477,0.477);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#6F335E").s().p("ApHVoQkOhyjQjQQjQjQhykOQh2kXAAkxQAAkwB2kYQBykNDQjQQDQjQEOhyQEXh2EwAAQExAAEXB2QEOByDQDQQDQDQByENQB2EYAAEwQAAExh2EXQhyEOjQDQQjQDQkOByQkXB2kxAAQkwAAkXh2g");
	this.shape_1.setTransform(74.7,74.9,0.477,0.477);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FBEDD2").s().p("AphWkQkZh3jZjZQjZjZh3kaQh7kjAAk+QAAk9B7kkQB3kZDZjZQDZjZEZh3QEjh7E+AAQE+AAEkB7QEZB3DZDZQDZDZB3EZQB7EkAAE9QAAE+h7EjQh3EajZDZQjZDZkZB3QkkB7k+AAQk+AAkjh7g");
	this.shape_2.setTransform(74.7,74.7,0.477,0.477);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape},{t:this.score}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,162.5,149.4);


(lib.Rúralight = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap89();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,138,84);


(lib.Rúratweencopy = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap125_1();
	this.instance.setTransform(-77.4,-53.5,0.501,0.501);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-77.4,-53.5,117.2,23.5);


(lib.Rúratween = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap11();
	this.instance.setTransform(-77.4,-53.5);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-77.4,-53.5,155,107);


(lib.reprak = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_14 = function() {
		this.stop();
		//console.log('rep1 vis p1'); 
		exportRoot.breprak.visible = true;
		//console.log('rep1 vis p2');
	}
	this.frame_29 = function() {
		this.gotoAndStop(0);
		exportRoot.breprak.visible = true;
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(14).call(this.frame_14).wait(15).call(this.frame_29).wait(1));

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBEDD2").s().p("Ah+KRQAhhYAWhBQBXkPAAjpQAAjohXkPIg3iZQgTg4AKAAQAPAAAqA4QAxBAArBZQB9D6AAD9QAAD+h9D6QgrBZgxBAQgqA4gPAAQgKAAATg4g");
	this.shape.setTransform(32.6,25.1,0.16,0.16);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FBEDD2").s().p("AicMwQAphuAahQQBtlRAAkhQAAkhhtlRIhDi9QgZhGANAAQASAAA1BGQA9BPA2BuQCcE3AAE7QAAE8icE2Qg2Bvg9BPQg1BGgSAAQgNAAAZhGg");
	this.shape_1.setTransform(39.3,25.1,0.16,0.16);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FBEDD2").s().p("AiLIpIgwAHQgsAAgggbQgggaAAglIAAhOIihAAQgsAAgggbQgggaABgmIAApaQgBglAggaQAggbAsAAIChAAIAAhOQAAglAggbQAggbAsAAIAwAHIK/mfIAAeRg");
	this.shape_2.setTransform(17.1,25.1,0.16,0.16);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#ED7E24").s().p("AhHCCQgSgFgygSQgngNgSgDQgcgEgPALQAAgxASgtQATgpAhghQAhghAsgTQAsgSAwAAQAwAAAtASQArATAiAhQAgAhATApQATAtAAAxQgQgLgbAEQgTADgmANQgyASgSAFQgpALgfAAQgeAAgpgLg");
	this.shape_3.setTransform(25.3,15.7);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#E96626").s().p("AhcDdQgsgSghghQghgigTgrQgSgtAAgwQAAgvASgtQATgrAhghQAhgiAsgSQAsgTAwAAQAwAAAtATQArASAiAiQAgAhATArQATAtAAAvQAAAwgTAtQgTArggAiQgiAhgrASQgtATgwAAQgwAAgsgTg");
	this.shape_4.setTransform(25.3,25.7);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#FBEDD2").s().p("AphWkQkZh3jZjZQjZjZh3kaQh7kjAAk+QAAk9B7kkQB3kZDZjZQDZjZEZh3QEkh7E9AAQE+AAEjB7QEaB3DZDZQDZDZB3EZQB7EkAAE9QAAE+h7EjQh3EajZDZQjZDZkaB3QkjB7k+AAQk9AAkkh7g");
	this.shape_5.setTransform(25.3,25.6,0.16,0.16);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#FBEDD2").s().p("AlTLBQgbgNBJjNQBKjMCGkZQiXkNhXjHQhWjIAbgPQAYgOBtCVQBrCTCKDtQB6j1BiiZQBiicAaAMQAbAOhJDMQhKDMiGEZQCXEOBXDHQBWDHgbAPQgYAOhtiVQhriTiKjtQh6D2hiCZQhbCQgdAAIgEgBg");
	this.shape_6.setTransform(35.7,25.4,0.16,0.16);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_6}]},1).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_6}]},13).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]},1).to({state:[{t:this.shape_5},{t:this.shape_4},{t:this.shape_3},{t:this.shape_2},{t:this.shape_1},{t:this.shape}]},14).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0.2,0.6,50.2,50.2);


(lib.RECEPT = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.r_1.text = t_lang[chosenL][24][0];
		this.r_1.font = t_lang[chosenL][24][1];
		this.r_1.color = t_lang[chosenL][24][2];
		this.r_1.lineHeight = t_lang[chosenL][24][3];
		this.r_1.lineWidth = t_lang[chosenL][24][4];
		this.r_1.maxWidth = t_lang[chosenL][24][5];
		this.r_1.textAlign = t_lang[chosenL][24][6];
		this.r_1.textBaseline = t_lang[chosenL][24][7];
		this.r_1.rotation = t_lang[chosenL][24][8];
		if ((t_lang[chosenL][24][9]) != null && 
			(t_lang[chosenL][24][10]) != null)
		{	
			this.r_1.x = t_lang[chosenL][24][9];
			this.r_1.y = t_lang[chosenL][24][10];
		}
		
		this.r_2.text = t_lang[chosenL][25][0];
		this.r_2.font = t_lang[chosenL][25][1];
		this.r_2.color = t_lang[chosenL][25][2];
		this.r_2.lineHeight = t_lang[chosenL][25][3];
		this.r_2.lineWidth = t_lang[chosenL][25][4];
		this.r_2.maxWidth = t_lang[chosenL][25][5];
		this.r_2.textAlign = t_lang[chosenL][25][6];
		this.r_2.textBaseline = t_lang[chosenL][25][7];
		this.r_2.rotation = t_lang[chosenL][25][8];
		if ((t_lang[chosenL][25][9]) != null && 
			(t_lang[chosenL][25][10]) != null)
		{	
			this.r_2.x = t_lang[chosenL][25][9];
			this.r_2.y = t_lang[chosenL][25][10];
		}
		
		
		this.r_3.text = t_lang[chosenL][26][0];
		this.r_3.font = t_lang[chosenL][26][1];
		this.r_3.color = t_lang[chosenL][26][2];
		this.r_3.lineHeight = t_lang[chosenL][26][3];
		this.r_3.lineWidth = t_lang[chosenL][26][4];
		this.r_3.maxWidth = t_lang[chosenL][26][5];
		this.r_3.textAlign = t_lang[chosenL][26][6];
		this.r_3.textBaseline = t_lang[chosenL][26][7];
		this.r_3.rotation = t_lang[chosenL][26][8];
		if ((t_lang[chosenL][26][9]) != null && 
			(t_lang[chosenL][26][10]) != null)
		{	
			this.r_3.x = t_lang[chosenL][26][9];
			this.r_3.y = t_lang[chosenL][26][10];
		}
		
		this.r_4.text = t_lang[chosenL][27][0];
		this.r_4.font = t_lang[chosenL][27][1];
		this.r_4.color = t_lang[chosenL][27][2];
		this.r_4.lineHeight = t_lang[chosenL][27][3];
		this.r_4.lineWidth = t_lang[chosenL][27][4];
		this.r_4.maxWidth = t_lang[chosenL][27][5];
		this.r_4.textAlign = t_lang[chosenL][27][6];
		this.r_4.textBaseline = t_lang[chosenL][27][7];
		this.r_4.rotation = t_lang[chosenL][27][8];
		if ((t_lang[chosenL][27][9]) != null && 
			(t_lang[chosenL][27][10]) != null)
		{	
			this.r_4.x = t_lang[chosenL][27][9];
			this.r_4.y = t_lang[chosenL][27][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// txt
	this.r_4 = new cjs.Text("Recipe", "bold 16px 'Ubuntu'");
	this.r_4.name = "r_4";
	this.r_4.textAlign = "center";
	this.r_4.lineHeight = 18;
	this.r_4.lineWidth = 71;
	this.r_4.setTransform(17.1,85.2,1,1,-90);

	this.r_3 = new cjs.Text("Grate carrots very finely and place in a bowl. Add sugar, baking powder, and three types of flour. Pour oil, salt and milk.\n\nAll ingredients mix properly to create dough and pour into cupcake forms. Bake for 45 minutes at 170°C.\n\nFor decoration, crush brown sugar and add some orange juice to create thick liquid. Pour on top of muffins and add some carrot shavings.\n\nEnjoy!", "bold 14px 'Ubuntu'");
	this.r_3.name = "r_3";
	this.r_3.lineHeight = 16;
	this.r_3.lineWidth = 349;
	this.r_3.setTransform(81,293.4);

	this.r_2 = new cjs.Text("150 g - carrots\n90 g - brown sugar\n10 g - baking powder\n150 g - spelt flour\n130 g semi coarse flour\n20 g - soya flour\n5 g - salt\n60 ml - cold-pressed sunflower oil\n200 ml  - rice milk", "bold 14px 'Ubuntu'");
	this.r_2.name = "r_2";
	this.r_2.lineHeight = 16;
	this.r_2.lineWidth = 236;
	this.r_2.setTransform(81,103.1);

	this.r_1 = new cjs.Text("Healthy Carrot Cupcakes\nServes: 12", "bold 14px 'Ubuntu'");
	this.r_1.name = "r_1";
	this.r_1.lineHeight = 16;
	this.r_1.lineWidth = 236;
	this.r_1.setTransform(81,48.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.r_1},{t:this.r_2},{t:this.r_3},{t:this.r_4}]}).wait(1));

	// Layer 1
	this.instance = new lib.recptiek();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,456,598);


(lib.Pravédvereobj = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap7();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,107,108);


(lib.plnámysacopy = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap104();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,78,41);


(lib.plnámysa = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap67();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,78,41);


(lib.playbutton = function() {
	this.initialize();

	// Layer 4
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBEDD2").s().p("AkSFBQgLgHAAgMIAApcQAAgLALgHQAKgHAMAFIIOErQAMAIAAAPQAAAQgMAIIoOEqQgFADgGAAQgGAAgFgEg");
	this.shape.setTransform(66.5,23.5);

	// Layer 3
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#7B3C6E").s().p("AnEMvQhugfk5huQjxhUh3gSQisgZheBGQAAkyB2kXQBykMDQjQQDQjQEOhyQEXh2EwAAQExAAEXB2QEOByDQDQQDQDQByEMQB2EXAAEyQhehGisAZQh3ASjxBUQk5BuhuAfQj+BGjHAAQjGAAj+hGg");
	this.shape_1.setTransform(60,-3.6,0.44,0.44);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#6F335E").s().p("ApHVoQkOhyjQjQQjQjQhykOQh2kXAAkxQAAkwB2kYQBykNDQjQQDQjQEOhyQEXh2EwAAQExAAEXB2QEOByDQDQQDQDQByENQB2EYAAEwQAAExh2EXQhyEOjQDQQjQDQkOByQkXB2kxAAQkwAAkXh2g");
	this.shape_2.setTransform(60,23.9,0.44,0.44);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FBEDD2").s().p("AphWkQkZh3jZjZQjZjZh3kaQh7kjAAk+QAAk9B7kkQB3kZDZjZQDZjZEZh3QEjh7E+AAQE+AAEkB7QEZB3DZDZQDZDZB3EZQB7EkAAE9QAAE+h7EjQh3EajZDZQjZDZkZB3QkkB7k+AAQk+AAkjh7g");
	this.shape_3.setTransform(60,23.7,0.44,0.44);

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-9,-45.2,138,138);


(lib.pause_buttonik = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBEDD2").s().p("Ah9InQg1jlAAlCQAAlBA1jkQA0jlBJAAQBKAAA0DlQA1DkAAFBQAAFCg1DlQg0DkhKgBQhJABg0jkg");
	this.shape.setTransform(29.6,25.1,0.16,0.16);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FBEDD2").s().p("Ah+InQg0jlAAlCQAAlBA0jkQA1jlBJAAQBKAAA0DlQA1DkAAFBQAAFCg1DlQg0DkhKgBQhJABg1jkg");
	this.shape_1.setTransform(20.6,25.1,0.16,0.16);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#ED7E24").s().p("AhHCCQgSgFgygSQgngNgSgDQgcgEgPALQAAgxASgtQATgpAhghQAhghAsgTQAsgSAwAAQAwAAAtASQArATAiAhQAgAhATApQATAtAAAxQgQgLgbAEQgTADgmANQgyASgSAFQgpALgfAAQgeAAgpgLg");
	this.shape_2.setTransform(24.8,15.2);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#E96626").s().p("AhcDdQgsgSghghQghgigTgrQgSgtAAgwQAAgvASgtQATgrAhghQAhgiAsgSQAsgTAwAAQAwAAAtATQArASAiAiQAgAhATArQATAtAAAvQAAAwgTAtQgTArggAiQgiAhgrASQgtATgwAAQgwAAgsgTg");
	this.shape_3.setTransform(24.8,25.2);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#FBEDD2").s().p("AphWkQkZh3jZjZQjZjZh3kaQh7kjAAk+QAAk9B7kkQB3kZDZjZQDZjZEZh3QEkh7E9AAQE+AAEjB7QEaB3DZDZQDZDZB3EZQB7EkAAE9QAAE+h7EjQh3EajZDZQjZDZkaB3QkjB7k+AAQk9AAkkh7g");
	this.shape_4.setTransform(24.8,25.1,0.16,0.16);

	this.addChild(this.shape_4,this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-0.3,0.1,50.2,50.2);


(lib.padajúcicukor = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap35();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,4,18);


(lib.PadajúciBakingp = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap41();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,4,18);


(lib.Padajúcasoľ = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap46();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,4,18);


(lib.Padajúcamúka = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap44();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,4,18);


(lib.PACE = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_5.text = t_lang[chosenL][4][0];
		this.tt_5.font = t_lang[chosenL][4][1];
		this.tt_5.color = t_lang[chosenL][4][2];
		this.tt_5.lineHeight = t_lang[chosenL][4][3];
		this.tt_5.lineWidth = t_lang[chosenL][4][4];
		this.tt_5.maxWidth = t_lang[chosenL][4][5];
		this.tt_5.textAlign = t_lang[chosenL][4][6];
		this.tt_5.textBaseline = t_lang[chosenL][4][7];
		this.tt_5.rotation = t_lang[chosenL][4][8];
		if ((t_lang[chosenL][4][9]) != null && 
			(t_lang[chosenL][4][10]) != null)
		{	
			this.tt_5.x = t_lang[chosenL][4][9];
			this.tt_5.y = t_lang[chosenL][4][10];
		}
		
		
		
		this.tt_6.text = t_lang[chosenL][5][0];
		this.tt_6.font = t_lang[chosenL][5][1];
		this.tt_6.color = t_lang[chosenL][5][2];
		this.tt_6.lineHeight = t_lang[chosenL][5][3];
		this.tt_6.lineWidth = t_lang[chosenL][5][4];
		this.tt_6.maxWidth = t_lang[chosenL][5][5];
		this.tt_6.textAlign = t_lang[chosenL][5][6];
		this.tt_6.textBaseline = t_lang[chosenL][5][7];
		this.tt_6.rotation = t_lang[chosenL][5][8];
		if ((t_lang[chosenL][5][9]) != null && 
			(t_lang[chosenL][5][10]) != null)
		{	
			this.tt_6.x = t_lang[chosenL][5][9];
			this.tt_6.y = t_lang[chosenL][5][10];
		}
		
		
		this.tt_7.text = t_lang[chosenL][6][0];
		this.tt_7.font = t_lang[chosenL][6][1];
		this.tt_7.color = t_lang[chosenL][6][2];
		this.tt_7.lineHeight = t_lang[chosenL][6][3];
		this.tt_7.lineWidth = t_lang[chosenL][6][4];
		this.tt_7.maxWidth = t_lang[chosenL][6][5];
		this.tt_7.textAlign = t_lang[chosenL][6][6];
		this.tt_7.textBaseline = t_lang[chosenL][6][7];
		this.tt_7.rotation = t_lang[chosenL][6][8];
		if ((t_lang[chosenL][6][9]) != null && 
			(t_lang[chosenL][6][10]) != null)
		{	
			this.tt_7.x = t_lang[chosenL][6][9];
			this.tt_7.y = t_lang[chosenL][6][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 2
	this.tt_7 = new cjs.Text("FLOUR", "14px 'Ubuntu Light'", "#402415");
	this.tt_7.name = "tt_7";
	this.tt_7.textAlign = "center";
	this.tt_7.lineHeight = 22;
	this.tt_7.lineWidth = 64;
	this.tt_7.setTransform(448.9,497,1.003,1.003);

	this.tt_6 = new cjs.Text("BAKING\nPOWDER", "10px 'Ubuntu Light'", "#402415");
	this.tt_6.name = "tt_6";
	this.tt_6.textAlign = "center";
	this.tt_6.lineHeight = 7;
	this.tt_6.lineWidth = 64;
	this.tt_6.setTransform(360.9,497,1.003,1.003);

	this.tt_5 = new cjs.Text("SUGAR", "14px 'Ubuntu Light'", "#402415");
	this.tt_5.name = "tt_5";
	this.tt_5.textAlign = "center";
	this.tt_5.lineHeight = 22;
	this.tt_5.lineWidth = 64;
	this.tt_5.setTransform(272.3,497,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.tt_5},{t:this.tt_6},{t:this.tt_7}]}).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap146();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,586,722);


(lib.Olejobj = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap48();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,22,69);


(lib.Múkanaližičke = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap43();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,13,10);


(lib.myskamix = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap62();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,78,41);


(lib.muffin11 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap81();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,24,6);


(lib.Mrkvalvl1 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap18();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,71,13);


(lib.mrkvadrobky1 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap87();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,12,12);


(lib.moreg_sym = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_3.text = t_lang[chosenL][2][0];
		this.tt_3.font = t_lang[chosenL][2][1];
		this.tt_3.color = t_lang[chosenL][2][2];
		this.tt_3.lineHeight = t_lang[chosenL][2][3];
		this.tt_3.lineWidth = t_lang[chosenL][2][4];
		this.tt_3.maxWidth = t_lang[chosenL][2][5];
		this.tt_3.textAlign = t_lang[chosenL][2][6];
		this.tt_3.textBaseline = t_lang[chosenL][2][7];
		this.tt_3.rotation = t_lang[chosenL][2][8];
		if ((t_lang[chosenL][2][9]) != null && 
			(t_lang[chosenL][2][10]) != null)
		{	
			this.tt_3.x = t_lang[chosenL][2][9];
			this.tt_3.y = t_lang[chosenL][2][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// txt
	this.tt_3 = new cjs.Text("More Games", "29px 'Rancho'", "#FBEDD2");
	this.tt_3.name = "tt_3";
	this.tt_3.lineHeight = 37;
	this.tt_3.lineWidth = 210;
	this.tt_3.setTransform(17.5,77.4,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get(this.tt_3).wait(1));

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#7B3C6E").s().p("AnEMvQhugfk5huQjxhUh3gSQisgZheBGQAAkyB2kXQBykMDQjQQDQjQEOhyQEXh2EwAAQExAAEXB2QEOByDQDQQDQDQByEMQB2EXAAEyQhehGisAZQh3ASjxBUQk5BuhuAfQj+BGjHAAQjGAAj+hGg");
	this.shape.setTransform(74.7,45.1,0.477,0.477);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#6F335E").s().p("ApHVoQkOhyjQjQQjQjQhykOQh2kXAAkxQAAkwB2kYQBykNDQjQQDQjQEOhyQEXh2EwAAQExAAEXB2QEOByDQDQQDQDQByENQB2EYAAEwQAAExh2EXQhyEOjQDQQjQDQkOByQkXB2kxAAQkwAAkXh2g");
	this.shape_1.setTransform(74.7,74.9,0.477,0.477);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#FBEDD2").s().p("AphWkQkZh3jZjZQjZjZh3kaQh7kjAAk+QAAk9B7kkQB3kZDZjZQDZjZEZh3QEjh7E+AAQE+AAEkB7QEZB3DZDZQDZDZB3EZQB7EkAAE9QAAE+h7EjQh3EajZDZQjZDZkZB3QkkB7k+AAQk+AAkjh7g");
	this.shape_2.setTransform(74.7,74.7,0.477,0.477);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_2},{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,232.5,149.4);


(lib.Mliekoobj = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap561();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,35,48);


(lib.menu_btn = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBEDD2").s().p("AgeDxQgzgJgqgeQgpgegcgsIguAUQgFADgEgBQgJAAgBgMIgBjDQAAgKAKgEQAGgDAGACIAFADICQCEQAJAJgGAHQgDADgFACIg1AXQA4BRBhAFQBmAFBAhTQAkguABg9QACg4gdg0Qgig8hEgXQhAgVhCAUQgXAGgFgYQgFgZAXgGQBOgYBKAbQBEAYAuA7QAtA7AFBJQAHBNgqBGQgmBAhJAdQgwAUgyAAQgVAAgXgEg");
	this.shape.setTransform(59.4,26.5,1.382,1.382);

	// Layer 3
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#7B3C6E").s().p("AnEMvQhugfk5huQjxhUh3gSQisgZheBGQAAkyB2kXQBykMDQjQQDQjQEOhyQEXh2EwAAQExAAEXB2QEOByDQDQQDQDQByEMQB2EXAAEyQhehGisAZQh3ASjxBUQk5BuhuAfQj+BGjHAAQjGAAj+hGg");
	this.shape_1.setTransform(60,-3.6,0.44,0.44);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#6F335E").s().p("ApHVoQkOhyjQjQQjQjQhykOQh2kXAAkxQAAkwB2kYQBykNDQjQQDQjQEOhyQEXh2EwAAQExAAEXB2QEOByDQDQQDQDQByENQB2EYAAEwQAAExh2EXQhyEOjQDQQjQDQkOByQkXB2kxAAQkwAAkXh2g");
	this.shape_2.setTransform(60,23.9,0.44,0.44);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FBEDD2").s().p("AphWkQkZh3jZjZQjZjZh3kaQh7kjAAk+QAAk9B7kkQB3kZDZjZQDZjZEZh3QEjh7E+AAQE+AAEkB7QEZB3DZDZQDZDZB3EZQB7EkAAE9QAAE+h7EjQh3EajZDZQjZDZkZB3QkkB7k+AAQk+AAkjh7g");
	this.shape_3.setTransform(60,23.7,0.44,0.44);

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-9,-45.2,138,138);


(lib.Lízátko3rdposition = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap80();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,88,36);


(lib.Lízátko2ndpos = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap78();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,24,93);


(lib.Lízatkocopy = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap113();
	this.instance.setTransform(0,0,0.498,0.498);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,16,40.9);


(lib.Lízatko = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap10();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,16,41);


(lib.Ližičkalvl3 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap22();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,55,7);


(lib.Ližičkatween = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#E7F1F2").s().p("AkPASQABgKADgDQBsgGBsABICWAAQAFgKAWgIQAVgIAggCQAkgDAbAIQAcAHADAOIAAABQgaAEgVACQADgDgBgCQgBgEgJgCQARgLAAgGIgMgCQABAGgKAMQgMgDgWACQgEgHgBgKQgfAFgLAEQgRAFgIAIQAAAJAVANQgYgLhyAEQhyADiUAPQgBgDABgJg");
	this.shape.setTransform(0,-0.6);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#C2CBCC").s().p("AgzAWQgbgHgDgKQgCgHAagKQAYgKAggDQAdgCAaAHQAaAGACAKQACAIgYAKQgXAJgfADIgNAAQgXAAgVgEg");
	this.shape_1.setTransform(18.5,-0.8);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#A2AAA9").s().p("ABmAAQg1gChIACQh8ABh6AOIgCgFQDBgRCzgCQCEgCAngKQACANgdANQgdAOgjADIgNAAQgsAAgWgWg");
	this.shape_2.setTransform(0.1,1.4);

	this.addChild(this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-27.3,-3.6,54.7,7.4);


(lib.kopkamrkvycopy = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap124();
	this.instance.setTransform(0,0,0.507,0.507);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,48.7,14.7);


(lib.kopkamrkvy = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap31();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,48,15);


(lib.Flourtween = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_7.text = t_lang[chosenL][6][0];
		this.tt_7.font = t_lang[chosenL][6][1];
		this.tt_7.color = t_lang[chosenL][6][2];
		this.tt_7.lineHeight = t_lang[chosenL][6][3];
		this.tt_7.lineWidth = t_lang[chosenL][6][4];
		this.tt_7.maxWidth = t_lang[chosenL][6][5];
		this.tt_7.textAlign = t_lang[chosenL][6][6];
		this.tt_7.textBaseline = t_lang[chosenL][6][7];
		this.tt_7.rotation = t_lang[chosenL][6][8];
		if ((t_lang[chosenL][6][9]) != null && 
			(t_lang[chosenL][6][10]) != null)
		{	
			this.tt_7.x = t_lang[chosenL][6][9];
			this.tt_7.y = t_lang[chosenL][6][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 2
	this.tt_7 = new cjs.Text("FLOUR", "14px 'Ubuntu Light'", "#402415");
	this.tt_7.name = "tt_7";
	this.tt_7.textAlign = "center";
	this.tt_7.lineHeight = 22;
	this.tt_7.lineWidth = 64;
	this.tt_7.setTransform(-0.7,-7,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get(this.tt_7).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap12();
	this.instance.setTransform(-44.8,-15.7);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-44.8,-15.7,90,32);


(lib.ClipGroup = function() {
	this.initialize();

	// Layer 2 (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	mask.graphics.p("AmyG8IiJm3IBpmfIGricQJlEngCAHQgCAFABErIABErIilALIgMBDQgUBHgoASQgXAHgdgHQg6gRgdhQIgLBOImjBQg");
	mask.setTransform(57.3,56.8);

	// Layer 3
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#C8C7C7").s().p("AApDgQgZAAgXgRQgWgPgLgSQgdgtghiQIgciKQBcCCAzhXQAbgsAJhFIAnCDQApCLACA1QgXB8hCAAIgBAAg");
	this.shape.setTransform(84.4,85.3);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#7D7D7D").s().p("AgYh2IAxDAIAAABIgCAOIgEANIgEALIgEAGQAIgSgrjbg");
	this.shape_1.setTransform(74.2,87.8);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#7D7D7D").s().p("AAMAuIgGgKQgBALgDAKQgRhJgPgxQAsBzAQARQgKgKgIgLg");
	this.shape_2.setTransform(59.6,97.4);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#7D7D7D").s().p("AAAAWQgMg0gRgmIAbA4IAhBEIgFgHQgGALgMAJQgDgUgFgbg");
	this.shape_3.setTransform(40.2,96.7);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#C8C7C7").s().p("AFxIHQgjgIghg0QgagmgXhIQgbhegSg6IAAAAIgCAPIgIAYIgFAKIgDAEIAAAAIAAABIgGAIIgCACIgHAJIgBABIgRAPIgCABQgaARgbgDQgegEgXggIgFgKQgJBJhEACQgdACgZgQQgagQgKgeIgFgKQgKARgRAKQgcATgZgGQghgGgZguIhciNIgQgYIAAgBQhRiFAgi3QANhLAeg/QAcg8AigdQASgPAfgSIApgZQguAdgMAJQhMBCgZCeQgcC0BRCFQAgA2AxAMQAsALARgeIAFAKQAKAdAYAOQAWAMAagFQA+gNAIhJIAGAKQAyApA0gWQAdgRAVgeQAVgfABgcIAJg3IAvCwQA6DFAyBgQAsBLAaANQAUALAkgTQgaAagbAAIgMgBg");
	this.shape_4.setTransform(55.9,75.5);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#B5B5B4").s().p("AgHAzQgXgDAYgwIAZgyQgFAKgBA2QAAAlgRAAIgDAAg");
	this.shape_5.setTransform(28.3,56.9);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#B5B5B4").s().p("AgNACIANg+QAAANAOA8QALAtgYADIgBAAQgXAAAKg7g");
	this.shape_6.setTransform(42.8,53.6);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#B5B5B4").s().p("AgFAVQgihFgMgKIA/AvQA6AxgbASQgGADgGAAQgTAAgRgmg");
	this.shape_7.setTransform(60,46.7);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#7D7D7D").s().p("AFWIgQgkgOgbgrIgFgHQgRgagJgXQgKgZgKgmQgVhSgPgpQgIAdgVAXQgWAYgbAIQgYAHgWgIQgWgIgSgXQgGAYgRAQQgOARgYAFQgeAHgdgMQgegMgQgZIgJgUQgZAhgiAAQguABghg7IgwhJQgdgsgPgXIgQgaIAAgBQhUiKAei3QAMhLAdg+QAbg8AhgcQBmhTBZgTQB9gaB9BWQAjAZAsA0QAtAzAlA7IABABQAvBLBNE5QA0DVATBqQAKAtgPAlQgPAmggANQgOAFgOAAQgPAAgPgGgADEDbIAaBBQALAeAHAeQAOA2AHAXQANAlAPAWQAZAnAfANQAaALAYgKQAagLANgdQAPgigKgtQgeiWgnigQhOk/guhJIgBgBQglg6grgyQgrgzgigYQh5hUh4AaQhWAThjBQQggAbgaA6QgcA9gLBIQgcCyBRCHIABACIAPAXQAPAXAdAsIAtBFIADAEIAGAKQAbAsAigCQARAAAQgLQANgKAJgOIAFgLIALAUIABACQAKAeAdAPQAdAPAfgHQAYgFANgSQAPgRADgbIACgVIAPAcQAgAsArgNQAcgJAWgcQAVgdABgeIABgdg");
	this.shape_8.setTransform(57.7,73.1);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#F7F7F8").s().p("AFXIaQghgOgagpQgYghgWhPQgdhpgTgtQgDA8g3AhQg6Aigrg7IgGgKQgIBJhEACQgeACgYgQQgagQgKgeIgGgKQgTAkgkADQgtAEggg7IhciMIgQgYIAAgBQhRiGAbi0QAYigBLhCQBmhSBagSQB5gYB4BTQAiAYAsAzQAtA0AlA7QAvBLBPFBQAnCiAeCTQAJArgOAjQgMAggbANQgPAIgQAAQgNAAgPgGg");
	this.shape_9.setTransform(57.7,73.1);

	this.shape.mask = this.shape_1.mask = this.shape_2.mask = this.shape_3.mask = this.shape_4.mask = this.shape_5.mask = this.shape_6.mask = this.shape_7.mask = this.shape_8.mask = this.shape_9.mask = mask;

	this.addChild(this.shape_9,this.shape_8,this.shape_7,this.shape_6,this.shape_5,this.shape_4,this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(12.1,18.1,91.3,95.5);


(lib.Path_1 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#7C1A50").s().p("AiKDuQhZg1gWhrQgXhoA6hjQA6hiBoghQBmghBZA0QBZA1AXBrQAWBog6BiQg5BkhoAgQgoANgkAAQg9AAg3ggg");
	this.shape.setTransform(25.7,27);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,-0.1,51.5,54.1);


(lib.Path = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#EF8FAB").p("AFphxQAhCYhTCOQhTCOiWAwQiUAviBhMQiBhLggiaQggiYBTiOQBTiOCVgvQCUgvCBBLQCBBMAgCZg");
	this.shape.setTransform(37.5,39.4);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-0.6,-0.6,76.1,79.9);


(lib.ZLATÁHVIEZDA3 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap141();
	this.instance.setTransform(-57.4,-57.7);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-57.4,-57.7,115,116);


(lib.ZoomIII = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_5.text = t_lang[chosenL][4][0];
		this.tt_5.font = t_lang[chosenL][4][1];
		this.tt_5.color = t_lang[chosenL][4][2];
		this.tt_5.lineHeight = t_lang[chosenL][4][3];
		this.tt_5.lineWidth = t_lang[chosenL][4][4];
		this.tt_5.maxWidth = t_lang[chosenL][4][5];
		this.tt_5.textAlign = t_lang[chosenL][4][6];
		this.tt_5.textBaseline = t_lang[chosenL][4][7];
		this.tt_5.rotation = t_lang[chosenL][4][8];
		if ((t_lang[chosenL][4][9]) != null && 
			(t_lang[chosenL][4][10]) != null)
		{	
			this.tt_5.x = t_lang[chosenL][4][9];
			this.tt_5.y = t_lang[chosenL][4][10];
		}
		
		
		
		this.tt_6.text = t_lang[chosenL][5][0];
		this.tt_6.font = t_lang[chosenL][5][1];
		this.tt_6.color = t_lang[chosenL][5][2];
		this.tt_6.lineHeight = t_lang[chosenL][5][3];
		this.tt_6.lineWidth = t_lang[chosenL][5][4];
		this.tt_6.maxWidth = t_lang[chosenL][5][5];
		this.tt_6.textAlign = t_lang[chosenL][5][6];
		this.tt_6.textBaseline = t_lang[chosenL][5][7];
		this.tt_6.rotation = t_lang[chosenL][5][8];
		if ((t_lang[chosenL][5][9]) != null && 
			(t_lang[chosenL][5][10]) != null)
		{	
			this.tt_6.x = t_lang[chosenL][5][9];
			this.tt_6.y = t_lang[chosenL][5][10];
		}
		
		
		this.tt_7.text = t_lang[chosenL][6][0];
		this.tt_7.font = t_lang[chosenL][6][1];
		this.tt_7.color = t_lang[chosenL][6][2];
		this.tt_7.lineHeight = t_lang[chosenL][6][3];
		this.tt_7.lineWidth = t_lang[chosenL][6][4];
		this.tt_7.maxWidth = t_lang[chosenL][6][5];
		this.tt_7.textAlign = t_lang[chosenL][6][6];
		this.tt_7.textBaseline = t_lang[chosenL][6][7];
		this.tt_7.rotation = t_lang[chosenL][6][8];
		if ((t_lang[chosenL][6][9]) != null && 
			(t_lang[chosenL][6][10]) != null)
		{	
			this.tt_7.x = t_lang[chosenL][6][9];
			this.tt_7.y = t_lang[chosenL][6][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 2
	this.tt_7 = new cjs.Text("FLOUR", "14px 'Ubuntu Light'", "#402415");
	this.tt_7.name = "tt_7";
	this.tt_7.textAlign = "center";
	this.tt_7.lineHeight = 22;
	this.tt_7.lineWidth = 64;
	this.tt_7.setTransform(551.7,639.1,1.195,1.177);

	this.tt_6 = new cjs.Text("BAKING\nPOWDER", "10px 'Ubuntu Light'", "#402415");
	this.tt_6.name = "tt_6";
	this.tt_6.textAlign = "center";
	this.tt_6.lineHeight = 7;
	this.tt_6.lineWidth = 64;
	this.tt_6.setTransform(436,639.5,1.195,1.177);

	this.tt_5 = new cjs.Text("SUGAR", "14px 'Ubuntu Light'", "#402415");
	this.tt_5.name = "tt_5";
	this.tt_5.textAlign = "center";
	this.tt_5.lineHeight = 22;
	this.tt_5.lineWidth = 64;
	this.tt_5.setTransform(319.2,639.9,1.195,1.177);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.tt_5},{t:this.tt_6},{t:this.tt_7}]}).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap148();

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,725,927);


(lib.Tween139_1 = function() {
	this.initialize();

	// Layer 1
	this.instance_1 = new lib.Bitmap149();
	this.instance_1.setTransform(-108.6,-198.3);

	this.addChild(this.instance_1);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-108.6,-198.3,217,397);


(lib.Tween131 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D1A08F").s().p("AhxCPQhQghgWhCQgXhAAwg8QAwg7BZgSQBYgTBPAhQBQAiAWBCQAXBAgwA7QgvA8hbASQgfAHgdAAQg3AAgzgWg");
	this.shape.setTransform(0,0,1.22,1.158,6.7);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-27.2,-19.1,54.5,38.3);


(lib.Tween130 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#D1A08F").s().p("AhxCPQhQghgWhCQgXhAAwg8QAwg7BZgSQBYgTBPAhQBQAiAWBCQAXBAgwA7QgvA8hbASQgfAHgdAAQg3AAgzgWg");
	this.shape.setTransform(0,0,1.22,1.158,6.7);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-27.2,-19.1,54.5,38.3);


(lib.Tween126 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FCF5F2").s().p("AhOAbQhDgdgxgeQAAhVBTAXQA9ARAwArQAVAVBNAgQAnARAhANQAjAOgLAQIgTANIgbAIQhbgKiFg/g");
	this.shape.setTransform(0.3,-0.2,0.478,0.478,10.7);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#2D140B").s().p("AhSB0QhcgVgRhwQgRh0BXASQA/ANA4AxQAVAVBNAgQAnARAhANQAjAOgLAQIgTANQh9AjgYAEQgoAHgeAAQgVAAgPgDg");
	this.shape_1.setTransform(0.1,0.7,0.478,0.478,10.7);

	this.addChild(this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-8.8,-6.2,17.6,12.5);


(lib.Tween125 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap145();
	this.instance.setTransform(-57.4,-67.3);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-57.4,-67.3,115,135);


(lib.Tween123 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#2D140B").s().p("AgNBhQgkgagVguQgWgsAHgoQAGgpAdgKQAegLAiAZQAkAZAVAuQAVAtgGAoQgGAogeALQgIADgKAAQgWAAgXgRg");
	this.shape.setTransform(0,0,0.555,0.555,4.9);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-4.7,-6.5,9.5,13);


(lib.Tween120 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap143();
	this.instance.setTransform(-95.4,-88);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-95.4,-88,218,166);


(lib.Toolbarzoom = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap147();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,405,138);


(lib.kucharnewcopy = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap150();
	this.instance.setTransform(0,0.1);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0.1,292,459);


(lib.depth = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#000000").s().p("EgkKA8PMAAAh4dMBIVAAAMAAAB4dg");
	this.shape.setTransform(231.5,385.6);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,463.1,771.2);


(lib.cukornaližičke = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap36();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,12,11);


(lib.continuebutton = function() {
	this.initialize();

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FBEDD2").s().p("AkSFBQgLgHAAgMIAApcQAAgLALgHQAKgHAMAFIIOErQAMAIAAAPQAAAQgMAIIoOEqQgFADgGAAQgGAAgFgEg");
	this.shape.setTransform(66.5,23.5);

	// Layer 3
	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#7B3C6E").s().p("AnEMvQhugfk5huQjxhUh3gSQisgZheBGQAAkyB2kXQBykMDQjQQDQjQEOhyQEXh2EwAAQExAAEXB2QEOByDQDQQDQDQByEMQB2EXAAEyQhehGisAZQh3ASjxBUQk5BuhuAfQj+BGjHAAQjGAAj+hGg");
	this.shape_1.setTransform(60,-3.6,0.44,0.44);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#6F335E").s().p("ApHVoQkOhyjQjQQjQjQhykOQh2kXAAkxQAAkwB2kYQBykNDQjQQDQjQEOhyQEXh2EwAAQExAAEXB2QEOByDQDQQDQDQByENQB2EYAAEwQAAExh2EXQhyEOjQDQQjQDQkOByQkXB2kxAAQkwAAkXh2g");
	this.shape_2.setTransform(60,23.9,0.44,0.44);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FBEDD2").s().p("AphWkQkZh3jZjZQjZjZh3kaQh7kjAAk+QAAk9B7kkQB3kZDZjZQDZjZEZh3QEjh7E+AAQE+AAEkB7QEZB3DZDZQDZDZB3EZQB7EkAAE9QAAE+h7EjQh3EajZDZQjZDZkZB3QkkB7k+AAQk+AAkjh7g");
	this.shape_3.setTransform(60,23.7,0.44,0.44);

	this.addChild(this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-9,-45.2,138,138);


(lib.biele_bg = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#FFFFFF").s().p("EgfoA4PMAAAhweMA/QAAAMAAABweg");
	this.shape.setTransform(-117.5,120);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-320,-240,405,720);


(lib.Bakingpnaližičke = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Bitmap42();

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,12,11);


(lib.Bakingptween = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.tt_6.text = t_lang[chosenL][5][0];
		this.tt_6.font = t_lang[chosenL][5][1];
		this.tt_6.color = t_lang[chosenL][5][2];
		this.tt_6.lineHeight = t_lang[chosenL][5][3];
		this.tt_6.lineWidth = t_lang[chosenL][5][4];
		this.tt_6.maxWidth = t_lang[chosenL][5][5];
		this.tt_6.textAlign = t_lang[chosenL][5][6];
		this.tt_6.textBaseline = t_lang[chosenL][5][7];
		this.tt_6.rotation = t_lang[chosenL][5][8];
		if ((t_lang[chosenL][5][9]) != null && 
			(t_lang[chosenL][5][10]) != null)
		{	
			this.tt_6.x = t_lang[chosenL][5][9];
			this.tt_6.y = t_lang[chosenL][5][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// Layer 2
	this.tt_6 = new cjs.Text("BAKING\nPOWDER", "10px 'Ubuntu Light'", "#402415");
	this.tt_6.name = "tt_6";
	this.tt_6.textAlign = "center";
	this.tt_6.lineHeight = 7;
	this.tt_6.lineWidth = 64;
	this.tt_6.setTransform(-2,-7.5,1.003,1.003);

	this.timeline.addTween(cjs.Tween.get(this.tt_6).wait(1));

	// Layer 1
	this.instance = new lib.Bitmap12();
	this.instance.setTransform(-44.8,-16);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-44.8,-16,90,32);


(lib.Path_6 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#6D6D6D").s().p("A/oAgIAAg/MA/RAAAIAAA/g");
	this.shape.setTransform(202.5,3.3);

	this.addChild(this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,405,6.5);


(lib.BACKGROUND = function() {
	this.initialize();

	// Background
	this.instance = new lib.Bitmap3();
	this.instance.setTransform(-80.5,-0.2);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-80.5,-0.2,565,722);


(lib.Ľavédverelvl3 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.Ľavedveretween();
	this.instance.setTransform(1.5,18,1,1,0,0,0,-53,-55.4);
	this.instance.cache(-56,-75,113,151);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,109,147);


(lib.Ľavédvere = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		playSound("dvere_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(3).call(this.frame_3).wait(11).call(this.frame_14).wait(1));

	// Ľavé dvere
	this.instance = new lib.Ľavedveretween("synched",0);
	this.instance.setTransform(6.3,18.7,1,1,0,0,0,-53,-55.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({scaleX:0.97},1).to({scaleX:1},4).to({scaleX:0.97},3).to({scaleX:1},3).to({startPosition:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(4.9,0.7,109,147);


(lib.Zrúryvon = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,negF:1,"animF":15,"endF":68});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_16 = function() {
		playSound("suflik_neg");
	}
	this.frame_53 = function() {
		playSound("muffinova_forma_von");
	}
	this.frame_54 = function() {
		playSound("rura_neg");
	}
	this.frame_68 = function() {
		this.stop();
		console.log('Zrúryvon');
		exportLevel();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(14).call(this.frame_14).wait(2).call(this.frame_16).wait(37).call(this.frame_53).wait(1).call(this.frame_54).wait(14).call(this.frame_68).wait(1));

	// úloha von z rúry
	this.instance = new lib.Tween93();
	this.instance.setTransform(30.9,-469.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(13));

	// Button
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(102,255,0,0)").s().p("AuDKHIAA0NIcHAAIAAUNg");
	this.shape.setTransform(77.4,55.3);

	this.timeline.addTween(cjs.Tween.get(this.shape).to({_off:true},1).wait(68));

	// rúra
	this.instance_1 = new lib.Rúratween("synched",0);
	this.instance_1.setTransform(77.3,107.3,1,1,0,0,0,0,53.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({startPosition:0},14).to({regY:53.5,scaleY:0.3},14).to({startPosition:0},20).to({regY:53.6,scaleY:1},20).wait(1));

	// fiktívna 3D rúra
	this.instance_2 = new lib.Tween24("synched",0);
	this.instance_2.setTransform(77.2,2.1);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({startPosition:0},14).to({y:73.4},14).to({startPosition:0},20).to({y:2.1},20).wait(1));

	// Osvetlenie rúry
	this.instance_3 = new lib.Rúralight();
	this.instance_3.setTransform(77.3,58.6,1,1,0,0,0,69.2,41.9);
	this.instance_3.alpha = 0.211;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(14).to({alpha:0.09},14).to({alpha:0},10).wait(31));

	// Upečené muffinové férmi
	this.instance_4 = new lib.Tween25("synched",0);
	this.instance_4.setTransform(77.6,53.2);

	this.instance_5 = new lib.Tween27("synched",0);
	this.instance_5.setTransform(93.1,-23.5,1.1,1.1);
	this.instance_5._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_4).to({startPosition:0},14).to({startPosition:0},14).to({_off:true,scaleX:1.1,scaleY:1.1,x:93.1,y:-23.5},15).wait(26));
	this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(28).to({_off:false},15).to({scaleX:1,scaleY:1,x:90.3,y:-80.5},10).to({startPosition:0},15).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-12.7,-521.8,180.2,642);


(lib.Zoomedváza = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		playSound("vaza_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(3).call(this.frame_3).wait(11).call(this.frame_14).wait(1));

	// Váza
	this.instance = new lib.Vázaobjcopy();
	this.instance.setTransform(41.7,128.6,1.283,1.283,0,0,0,13.7,54.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({rotation:-0.5},1).to({rotation:0.5},4).to({rotation:-0.5},3).to({rotation:0.5},3).to({rotation:0},3).wait(1));

	// Lízatko
	this.instance_1 = new lib.Lízatkocopy();
	this.instance_1.setTransform(47,60.8,1.283,1.283,0,0,0,4.2,41);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({rotation:-1},1).to({rotation:1,y:60.9},4).to({regX:4.3,rotation:-0.5,x:47.1,y:60.8},3).to({regX:4.2,rotation:0.5},3).to({rotation:0,x:47},3).wait(1));

	// Varecha
	this.instance_2 = new lib.Varechaobjcopy();
	this.instance_2.setTransform(33.3,61.1,1.283,1.283,0,0,0,15.3,43.2);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(2).to({regX:15.5,regY:43.3,rotation:2,x:33.4,y:61.2},3).to({regX:15.4,regY:43.2,rotation:-1,y:61.1},3).to({regX:15.3,rotation:1,x:33.3},3).to({rotation:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(13.7,5.7,48.4,123.7);


(lib.Zoomedrúra = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("rura_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// rúra
	this.instance = new lib.Rúratween("synched",0);
	this.instance.setTransform(102.5,139.8,1.283,1.283,0,0,0,0,53.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({startPosition:0},1).to({scaleY:1.24},4).to({scaleY:1.28},3).to({scaleY:1.26},3).to({scaleY:1.28},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(3.2,2.3,198.9,137.3);


(lib.vázavarech = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		playSound("vaza_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(3).call(this.frame_3).wait(11).call(this.frame_14).wait(1));

	// Váza
	this.instance = new lib.Vázaobj();
	this.instance.setTransform(43.9,92.1,1,1,0,0,0,13.7,54.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regX:13.6,regY:54.2,rotation:0.5,x:43.8,y:92},1).to({regX:13.7,regY:54.4,rotation:-0.5,y:92.1},4).to({regX:13.6,rotation:0.5},3).to({regX:13.7,rotation:-0.5},3).to({rotation:0,x:43.9},3).wait(1));

	// Varecha
	this.instance_1 = new lib.Varechaobj();
	this.instance_1.setTransform(37.4,39.6,1,1,0,0,0,15.3,43.2);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({rotation:3,y:39.5},1).to({rotation:-2},4).to({rotation:1},3).to({regX:15.4,rotation:-1,y:39.6},3).to({regX:15.3,rotation:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(22.1,-3.6,34.1,96.4);


(lib.vázalvl13 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		playSound("vaza_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(3).call(this.frame_3).wait(11).call(this.frame_14).wait(1));

	// váza
	this.instance = new lib.Vázaobjcopy();
	this.instance.setTransform(55.4,200.4,2.065,2.065,0,0,0,13.6,54.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regX:13.7,rotation:-1,x:55.6},1).to({regX:13.6,rotation:1,x:55.4,y:200.5},4).to({rotation:-0.5,y:200.4},3).to({rotation:0.5},3).to({rotation:0},3).wait(1));

	// Lízatko
	this.instance_1 = new lib.Lízatkocopy();
	this.instance_1.setTransform(64.2,91.5,2.065,2.065,0,0,0,4.2,41);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({rotation:-1},1).to({rotation:1},4).to({rotation:-1},4).to({rotation:1},2).to({rotation:0},3).wait(1));

	// Varecha
	this.instance_2 = new lib.Varechaobjcopy();
	this.instance_2.setTransform(42.3,92,2.065,2.065,0,0,0,15.4,43.2);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(1).to({rotation:1},4).to({rotation:-1},3).to({rotation:1},3).to({rotation:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(10.5,2.8,78,199);


(lib.Váza = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_2 = function() {
		playSound("vaza_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(2).call(this.frame_2).wait(12).call(this.frame_14).wait(1));

	// Váza
	this.instance = new lib.Vázaobj();
	this.instance.setTransform(43.9,92.1,1,1,0,0,0,13.7,54.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regY:54.3,rotation:-0.5},1).to({regX:13.6,rotation:0.5,x:43.8},4).to({regX:13.7,regY:54.4,rotation:-0.5},3).to({regX:13.6,regY:54.3,rotation:0.5},3).to({regX:13.7,regY:54.4,rotation:0,x:43.9},3).wait(1));

	// Lízatko
	this.instance_1 = new lib.Lízatko();
	this.instance_1.setTransform(48.1,39.3,1,1,0,0,0,4.2,41);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({rotation:-2},1).to({regY:41.1,rotation:2},4).to({regX:4.3,regY:41,rotation:-2},3).to({regX:4.2,regY:41.1,rotation:1},3).to({regY:41,rotation:0},3).wait(1));

	// Varecha
	this.instance_2 = new lib.Varechaobj();
	this.instance_2.setTransform(37.4,39.6,1,1,0,0,0,15.3,43.2);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({rotation:2,y:39.5},1).to({regX:15.5,rotation:-2},4).to({regX:15.4,regY:43.3,rotation:2,y:39.6},3).to({regX:15.5,rotation:-1,x:37.5},3).to({regX:15.3,regY:43.2,rotation:0,x:37.4},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(22.1,-3.6,37.8,96.4);


(lib.Veľkámyska = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("miska_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// Veľká myska
	this.instance = new lib.Veľkámysatween("synched",0);
	this.instance.setTransform(38.8,20.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({rotation:-2},1).to({rotation:2},4).to({rotation:-1},3).to({rotation:1},3).to({rotation:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,-0.2,78,41);


(lib.veľkámysa = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":34});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("miska_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_22 = function() {
		playSound("miska_na_stol");
	}
	this.frame_50 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(8).call(this.frame_22).wait(28).call(this.frame_50).wait(1));

	// úloha veľká mysa
	this.instance = new lib.Tween47("synched",0);
	this.instance.setTransform(138.3,-519.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({startPosition:0},34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},11).wait(1));

	// Veľkos myska
	this.instance_1 = new lib.Veľkámysatween("synched",0);
	this.instance_1.setTransform(50.9,26.8);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({rotation:-2},1).to({rotation:2},4).to({rotation:-1},3).to({rotation:1},3).to({rotation:0},3).to({x:116.8,y:-137.4},12,cjs.Ease.get(-0.6)).to({rotation:2,x:184.7,y:-145.3},6,cjs.Ease.get(-0.6)).to({rotation:-2},2).to({rotation:1},2).to({rotation:0},2).to({startPosition:0},12).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(12.2,-559.4,168.2,606.6);


(lib.varechaváza = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		playSound("vaza_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(3).call(this.frame_3).wait(11).call(this.frame_14).wait(1));

	// Layer 1
	this.instance = new lib.Vázaobj();
	this.instance.setTransform(28.2,89.5,1,1,0,0,0,13.7,54.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regY:54.3,rotation:-0.5,x:43.9,y:92.1},1).to({regX:13.6,rotation:0.5,x:43.8},4).to({regX:13.7,regY:54.4,rotation:-0.5},3).to({regX:13.6,regY:54.3,rotation:0.5},3).to({regX:13.7,regY:54.4,rotation:0,x:43.9},3).wait(1));

	// Lízatko
	this.instance_1 = new lib.Lízatko();
	this.instance_1.setTransform(32.4,36.7,1,1,0,0,0,4.2,41);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({rotation:-2,x:48.1,y:39.3},1).to({regY:41.1,rotation:2},4).to({regX:4.3,regY:41,rotation:-2},3).to({regX:4.2,regY:41.1,rotation:1},3).to({regY:41,rotation:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(14.5,-4.3,29.7,94.4);


(lib.Tween143 = function() {
	this.initialize();

	// Layer 1
	this.instance = new lib.ClipGroup();
	this.instance.setTransform(-1.3,-1.6,1.198,1.198,-29.9,0,0,57.4,64);

	this.addChild(this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-99.1,-102.2,186.7,194.3);


(lib.Tween83 = function() {
	this.initialize();

	// Layer 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#DDB28E").s().p("AgSgGIACgGIAjATIgCAGg");
	this.shape.setTransform(-5.4,14.6);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#FFEEFD").s().p("AhoCNQgDgDgBgEQAfACAugnQAlgiAWglQAjg6AHgQQAYg3gQghIgUAqQgFALgIgBIgRgJIgNgIQgGgFABgHQACAFAPAHIARAJQAHACAFgLIAWguIAKAGQAiAggXA/QgJAZgmA+QgbAtgtAkQgjAagZAAQgNAAgLgHg");
	this.shape_1.setTransform(-11.7,30.7);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#F9B2F2").s().p("AhKCbQgVgRA9iKIA/iGQAEgJAHgGQAQgNATAJIAFAEIAAAAQgTgKgPANQgIAGgEAJIg/CGQg8CJAUASIgFgDg");
	this.shape_2.setTransform(-15.3,28.9);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#FFCAF5").s().p("AhnCYQgVgQA9iJIA/iIQAEgJAHgGQAQgNATAKIAqAZIABAAQAiAggXBAQgIAWgnBAQgbAugtAjQgkAbgYAAQgOAAgKgIg");
	this.shape_3.setTransform(-12,29.4);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#DDB28E").s().p("AijEjQAMgEANAHIEJo0QARglAOALIAGAGQgJgEgHAIQgEAFgIAQIkII1g");
	this.shape_4.setTransform(6.6,-15.7);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#EFC8A5").s().p("AjhG/QgVgQA8iLIBBiIQAFgJAHgGQAPgNATAKIEJo0QARglAOALIADADQAQAMgTAkIkFI0QAoAggVA/QgHAWgoBDQgaAugwAjQgjAbgZAAQgNAAgKgIg");
	this.shape_5.setTransform(0.3,-0.1);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#C9436D").s().p("AipEjQhug/gbiDQgciBBHh5QBHh4B/gpQB+goBtBAQBuBAAbCDQAcCBhHB4QhHB5h/AoQgxAPgsAAQhKAAhEgngAg0kAQhoAhg6BiQg6BjAXBpQAWBrBZA0QBaA0BmggQBoghA5hjQA6hjgWhoQgXhrhZg0Qg3ghg9AAQgjAAgoANg");
	this.shape_6.setTransform(0,-0.1);

	this.instance = new lib.Path();
	this.instance.setTransform(0.1,0,1,1,0,0,0,37.5,39.4);
	this.instance.alpha = 0.602;

	this.instance_1 = new lib.Path_1();
	this.instance_1.setTransform(0.1,-0.1,1,1,0,0,0,25.7,26.9);
	this.instance_1.alpha = 0.699;

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f().s("#EF9ECE").p("AFphxQAhCYhTCOQhTCOiWAwQiUAviBhMQiBhLggiaQggiYBTiOQBTiOCVgvQCUgvCBBLQCBBMAgCZg");

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#BA3565").s().p("AjHFWQiBhLggiaQggiYBTiOQBTiOCVgvQCUgvCBBLQCBBMAgCZQAhCYhTCOQhTCOiWAwQg6ASg0AAQhYAAhPgvg");

	this.addChild(this.shape_8,this.shape_7,this.instance_1,this.instance,this.shape_6,this.shape_5,this.shape_4,this.shape_3,this.shape_2,this.shape_1,this.shape);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-38,-45.6,76.2,91.3);


(lib.Toolbarzoom_1 = function() {
	this.initialize();

	// Layer 1
	this.instance_1 = new lib.Bitmap51();

	this.instance_2 = new lib.Path_6();
	this.instance_2.setTransform(202.5,134.2,1,1,0,0,0,202.5,3.2);
	this.instance_2.alpha = 0.5;

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#9E9E9E").s().p("A/oKqIAA1TMA/QAAAIAAVTg");
	this.shape.setTransform(202.5,68.2);

	this.addChild(this.shape,this.instance_2,this.instance_1);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(0,0,405,137.5);


(lib.tanierstruhanámrkva = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":55});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		playSound("tanier_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_35 = function() {
		playSound("struh_mrkva_do_misky");
	}
	this.frame_51 = function() {
		playSound("tanier_stol");
	}
	this.frame_55 = function() {
		this.stop();
		console.log('tanierstruhanámrkva');
		exportLevel();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(3).call(this.frame_3).wait(11).call(this.frame_14).wait(21).call(this.frame_35).wait(16).call(this.frame_51).wait(4).call(this.frame_55).wait(1));

	// úloha nabratie cukru
	this.instance = new lib.Tween79();
	this.instance.setTransform(76.6,-351.9);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(56));

	// úloha mrkvu vysyp
	this.instance_1 = new lib.Tween49("synched",0);
	this.instance_1.setTransform(-23.2,-353.4);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({startPosition:0},34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).wait(1));

	// Nastúhaná Mrkva
	this.instance_2 = new lib.kopkamrkvy();
	this.instance_2.setTransform(38.4,20.1,0.9,0.9,0,0,0,23.9,14.8);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({rotation:-2,x:38.5},1).to({rotation:2,x:38.2,y:20.2},4).to({rotation:-1},3).to({regY:14.7,rotation:0,x:38.1},3).to({regY:14.8,rotation:1,x:38.4,y:20.1},3).to({scaleX:0.9,scaleY:0.9,rotation:-44.7,x:-50.5,y:-43.6},10).wait(5).to({rotation:-59.7,x:-72.9,y:-17},4).to({scaleX:0.67,scaleY:0.9,rotation:-68.7,x:-74.6,y:-4},4).to({scaleX:0.56,scaleY:0.9,rotation:-73,x:-75.6,y:2.4,alpha:0},4).to({_off:true},1).wait(14));

	// Tanier
	this.instance_3 = new lib.Taniernastôl();
	this.instance_3.setTransform(37.3,25.3,1,1,0,0,0,37.2,13.3);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).to({regX:37.3,rotation:-2,x:37.7},1).to({regX:37.2,rotation:2,x:37},4).to({rotation:-1},3).to({rotation:0,x:36.8},3).to({regX:37.3,rotation:1,x:37.5},3).to({scaleX:1,scaleY:1,rotation:-44.7,x:-47.5,y:-39.2},10).wait(5).to({regX:37.2,regY:13.2,rotation:-59.7,x:-47.9,y:-43},4).wait(8).to({rotation:0,x:-209.7,y:214.6},13,cjs.Ease.get(-0.6)).wait(2));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-61.4,-393.8,183.2,418.8);


(lib.taniersmrkvou = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("tanier_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// nastruhaná mrkva
	this.instance = new lib.kopkamrkvycopy();
	this.instance.setTransform(42.3,18.4,1.155,1.155,0,0,0,23.9,14.8);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1).to({rotation:-2,x:42.6,y:18.5},4).to({rotation:1,x:42.2,y:18.4},3).to({rotation:-1,x:42.5},3).to({rotation:0,x:42.4},3).wait(1));

	// Zelený tanier
	this.instance_1 = new lib.Tween10copy("synched",0);
	this.instance_1.setTransform(42.3,15.5,1.283,1.283);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({startPosition:0},1).to({rotation:-2,x:42.4},4).to({rotation:1,x:42.2},3).to({rotation:-1,x:42.4},3).to({rotation:0,x:42.3},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(4.9,1.3,73.7,20.8);


(lib.tanierlvl13 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("tanier_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// nastrúhaná mrkva
	this.instance = new lib.kopkamrkvycopy();
	this.instance.setTransform(79.1,31.9,1.847,1.847,0,0,0,23.9,14.8);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({rotation:-2,x:79.5},1).to({rotation:2,x:78.8},4).to({rotation:-1,x:79.3,y:32},3).to({rotation:1,x:78.8,y:31.9},3).to({rotation:0,x:79.1},3).wait(1));

	// Zelený tanier
	this.instance_1 = new lib.Tween10copy("synched",0);
	this.instance_1.setTransform(79,27.3,2.053,2.053);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({rotation:-2,x:79.2},1).to({rotation:2,x:78.8},4).to({rotation:-1,x:79.2},3).to({rotation:1,x:78.9},3).to({rotation:0,x:79},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(19.2,4.6,117.9,33.3);


(lib.Tanierlvl1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":55});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("tanier_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_29 = function() {
		playSound("tanier_stol");
	}
	this.frame_34 = function() {
		playSound("dvere_zatvor");
	}
	this.frame_55 = function() {
		this.stop();
		console.log('Tanierlvl1');
		exportLevel();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(15).call(this.frame_29).wait(5).call(this.frame_34).wait(21).call(this.frame_55).wait(1));

	// Pravé dvere
	this.instance = new lib.Pravédvereobj();
	this.instance.setTransform(105.6,-69.1,1,1,0,0,180,105.6,8.6);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(15).to({_off:false},0).wait(19).to({scaleX:0.03,skewY:0},5).to({scaleX:1},15,cjs.Ease.get(-0.6)).wait(2));

	// úloha struhanie
	this.instance_1 = new lib.Tween42("synched",0);
	this.instance_1.setTransform(65,-536.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(56));

	// úloha tanier
	this.instance_2 = new lib.Tween40("synched",0);
	this.instance_2.setTransform(-41.2,-537.9);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({startPosition:0},34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).wait(1));

	// Tanier na stôl
	this.instance_3 = new lib.Taniernastôl();
	this.instance_3.setTransform(45.5,27.6,1,1,0,0,0,37.2,13.3);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).to({regY:13.2,rotation:-3,y:27.5},1).to({rotation:3},4).to({regY:13.3,rotation:-2,x:45.6,y:27.6},3).to({rotation:1,x:45.5},3).to({rotation:0},3).to({x:6.3,y:-80.2},8).to({scaleX:1,scaleY:1,rotation:576.1,x:-31.5,y:-184.7},7).to({scaleX:1,scaleY:1,rotation:720,x:-76.7,y:-141.6},5).wait(22));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-88.1,-584.6,195.9,611.9);


(lib.tanierlvl14 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":36});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_34 = function() {
		playSound("tanier_stol");
	}
	this.frame_56 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(14).call(this.frame_14).wait(20).call(this.frame_34).wait(22).call(this.frame_56).wait(1));

	// úloha tanier s mrkvou
	this.instance = new lib.Tween111("synched",0);
	this.instance.setTransform(24.2,-567.2);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({startPosition:0},34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(1));

	// nastrúhaná mrkva
	this.instance_1 = new lib.kopkamrkvycopy();
	this.instance_1.setTransform(59.9,28,1.847,1.847,0,0,0,23.9,14.8);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(14).to({x:310.2,y:-120.7},22,cjs.Ease.get(-1)).wait(19).to({_off:true},1).wait(1));

	// Zelený tanier
	this.instance_2 = new lib.Tween10copy("synched",0);
	this.instance_2.setTransform(59.8,23.3,2.053,2.053);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({startPosition:0},14).to({x:310.1,y:-125.4},22,cjs.Ease.get(-1)).to({startPosition:0},19).to({_off:true},1).wait(1));

	// Maska (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	var mask_graphics_0 = new cjs.Graphics().p("AICldIAAmIIVgAAIAAGIg");

	this.timeline.addTween(cjs.Tween.get(mask).to({graphics:mask_graphics_0,x:189.1,y:-74.3}).wait(56).to({graphics:null,x:0,y:0}).wait(1));

	// podklad stôl
	this.instance_3 = new lib.Bitmap134();
	this.instance_3.setTransform(-110.9,-149.6);

	this.instance_3.mask = mask;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).to({_off:true},56).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-20.1,-607.2,398.3,641.1);


(lib.tanier2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":94});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("tanier_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_39 = function() {
		playSound("struh_mrkva_do_misky");
	}
	this.frame_51 = function() {
		playSound("struh_mrkva_do_misky");
	}
	this.frame_79 = function() {
		playSound("tanier_stol");
	}
	this.frame_94 = function() {
		this.stop();
		console.log('tanier2');
		PokiSDK.happyTime(1);
		exportLevel();
		stopujI();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(25).call(this.frame_39).wait(12).call(this.frame_51).wait(28).call(this.frame_79).wait(15).call(this.frame_94).wait(1));

	// Layer 2
	this.instance = new lib.depth();
	this.instance.setTransform(-68,-139.9,1,1,0,0,0,231.5,385.6);
	this.instance.alpha = 0;
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(85).to({_off:false},0).to({alpha:1},9).wait(1));

	// úloha deko mrkvou
	this.instance_1 = new lib.Tween113("synched",0);
	this.instance_1.setTransform(-22.7,-421.9);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({startPosition:0},30).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},14).to({_off:true},1).wait(45));

	// mrkva 3/3
	this.instance_2 = new lib.Tween119("synched",0);
	this.instance_2.setTransform(-16.6,8.7,0.175,0.175);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(50).to({_off:false},0).to({scaleX:0.81,scaleY:0.56,x:-31.9,y:41.7},12).to({startPosition:0},17).to({startPosition:0},6).to({startPosition:0},9).wait(1));

	// mrkva 2/3
	this.instance_3 = new lib.Tween118("synched",0);
	this.instance_3.setTransform(-21.1,7.8,0.876,0.619,0,0,0,4.7,-14.2);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(36).to({_off:false},0).to({regX:4.6,regY:-14.1,scaleX:1.48,scaleY:0.35,x:-28.7,y:33.3},6).to({startPosition:0},7).to({startPosition:0},13).to({startPosition:0},17).to({startPosition:0},6).to({startPosition:0},9).wait(1));

	// mrkva 1/3
	this.instance_4 = new lib.kopkamrkvycopy();
	this.instance_4.setTransform(62.4,24.6,1.847,1.847,0,0,0,23.9,14.8);

	this.timeline.addTween(cjs.Tween.get(this.instance_4).to({rotation:-2,x:62.8},1).to({rotation:2,x:62.1,y:24.7},4).to({rotation:-1,x:62.6},3).to({rotation:1,x:62.2,y:24.6},3).to({rotation:0,x:62.4},3).to({scaleX:1.85,scaleY:1.85,rotation:-12,x:30.5,y:-12.1},14).to({rotation:-31.4,x:30.4},8).to({rotation:-35.4},6).to({rotation:-31.4},7).to({rotation:-35.4},5).to({rotation:-31.4},8).to({regX:24,rotation:6.1,x:-173.2,y:49.8},9).to({scaleX:1.69,scaleY:1.69,rotation:1,x:-191,y:174.2},8).to({y:169.7},3).to({y:173.3},3).wait(10));

	// Zelený tanier
	this.instance_5 = new lib.Tween10copy("synched",0);
	this.instance_5.setTransform(62.3,20,2.053,2.053);

	this.timeline.addTween(cjs.Tween.get(this.instance_5).to({rotation:-2,x:62.5},1).to({rotation:2,x:62.1},4).to({rotation:-1,x:62.4},3).to({rotation:1,x:62.2},3).to({rotation:0,x:62.3},3).to({scaleX:2.05,scaleY:2.05,rotation:-12,x:29.5,y:-16.6},14).to({rotation:-30,x:30.8,y:-16.8},8).to({rotation:-35,y:-17.2},6).to({rotation:-30,y:-16.8},7).to({rotation:-35,y:-17.2},5).to({rotation:-30,y:-16.8},8).to({rotation:7,x:-172.8,y:45.3},9).to({scaleX:2.05,scaleY:2.05,rotation:0,x:-193.3,y:169.7},8).to({startPosition:0},3).to({startPosition:0},3).to({startPosition:0},9).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-60.7,-467.8,181.1,498.4);


(lib.Tanier = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("tanier_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// Tanier
	this.instance = new lib.Taniernastôl();
	this.instance.setTransform(37.2,26.6,0.999,0.999,0,0,0,37.2,13.2);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regX:37.3,rotation:-2,y:26.5},1).to({regX:37.2,rotation:2},4).to({rotation:-1,y:26.6},3).to({regX:37.3,rotation:1},3).to({regX:37.2,rotation:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,13.4,74.9,13);


(lib.Symbol4 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_79 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(79).call(this.frame_79).wait(1));

	// Layer 5
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(0,255,0,0)").s().p("AnCIWIAAwrIOFAAIAAQrg");
	this.shape.setTransform(114.9,128);

	this.timeline.addTween(cjs.Tween.get(this.shape).to({_off:true},73).wait(7));

	// Layer 1
	this.instance = new lib.Tween144("synched",0);
	this.instance.setTransform(45.3,97.9);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(17).to({_off:false},0).to({x:59.4,y:109.4},6).to({x:42.1,y:91.5},8).to({x:59.4,y:109.4},8).to({x:45.3,y:97.9},11).to({startPosition:0},13).to({_off:true},1).wait(16));

	// Layer 1
	this.instance_1 = new lib.Tween143("synched",0);
	this.instance_1.setTransform(-308.1,-107.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({x:33.9,y:94.4},16,cjs.Ease.get(-1)).to({_off:true},1).wait(47).to({_off:false},0).to({x:-308.1,y:-107.6},14,cjs.Ease.get(-1)).to({_off:true},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-367.5,-156.2,527.6,337.6);


(lib.Symbol3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("ZIP1");
	}
	this.frame_11 = function() {
		this.stop();
		
		var _this = this;
		
		this.brecept2.on("click", recipeF2);
		
		function recipeF2(evt) 
			
			{		
				_this.gotoAndPlay(12);
			}
	}
	this.frame_12 = function() {
		playSound("ZIP1");
	}
	this.frame_23 = function() {
		this.stop();
		this.gotoAndStop(0);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(10).call(this.frame_11).wait(1).call(this.frame_12).wait(11).call(this.frame_23).wait(1));

	// Layer 6
	this.brecept2 = new lib.l1b4();
	this.brecept2.setTransform(-270.7,-134.9,3.943,5.122,0,0,0,-0.2,1.4);
	this.brecept2._off = true;
	new cjs.ButtonHelper(this.brecept2, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get(this.brecept2).wait(11).to({_off:false},0).to({_off:true},1).wait(12));

	// Layer 1
	this.instance = new lib.RECEPT();
	this.instance.setTransform(232.2,69.8,1,1,0,0,0,228,296.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({x:-168.8},11).wait(1).to({x:232.2},11).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(4.2,-226.6,456.1,598.1);


(lib.Sugaršuflík = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		playSound("suflik_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(3).call(this.frame_3).wait(11).call(this.frame_14).wait(1));

	// Sugar šuflík
	this.instance = new lib.Sugartween();
	this.instance.setTransform(45.3,16.2);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1).to({scaleX:1.02,scaleY:1.02},4).to({scaleX:1,scaleY:1},3).to({scaleX:1.02,scaleY:1.02},3).to({scaleX:1,scaleY:1},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0.5,0.2,90,32);


(lib.sugar = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		playSound("suflik_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(3).call(this.frame_3).wait(11).call(this.frame_14).wait(1));

	// cukor šuflík
	this.instance = new lib.Sugartween();
	this.instance.setTransform(58.1,21.8,1.28,1.28);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1).to({scaleX:1.31,scaleY:1.31},4).to({scaleX:1.28,scaleY:1.28},3).to({scaleX:1.3,scaleY:1.3},3).to({scaleX:1.28,scaleY:1.28},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0.8,1.3,115.2,41);


(lib.Strúhadlolvl2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":103});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_33 = function() {
		playSound("struhanie_mrkvy");
	}
	this.frame_57 = function() {
		playSound("dvere_otvor");
	}
	this.frame_83 = function() {
		playSound("struhadlo_stol");
	}
	this.frame_103 = function() {
		this.stop();
		console.log('Strúhadlolvl2');
		PokiSDK.happyTime(0.15);
		exportLevel();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(14).call(this.frame_14).wait(19).call(this.frame_33).wait(24).call(this.frame_57).wait(26).call(this.frame_83).wait(20).call(this.frame_103).wait(1));

	// úloha nabratia cukru
	this.instance = new lib.Tween79();
	this.instance.setTransform(-321.5,-315);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(64).to({_off:false},0).to({rotation:360,x:78},20).wait(20));

	// úloha vysypania mrkvy
	this.instance_1 = new lib.Tween49();
	this.instance_1.setTransform(-321.8,-316.7);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(69).to({_off:false},0).to({rotation:360,x:-21.9,mode:"synched",startPosition:0},20).to({startPosition:0},14).wait(1));

	// úloha veľká mysa
	this.instance_2 = new lib.Tween47("synched",0);
	this.instance_2.setTransform(-322.9,-315.2);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(74).to({_off:false},0).to({rotation:360,x:-123.1},20).to({startPosition:0},9).wait(1));

	// úloha soľ
	this.instance_3 = new lib.Tween45();
	this.instance_3.setTransform(-321.9,-315.2);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(79).to({_off:false},0).to({rotation:360,x:-221.9},20).wait(5));

	// úloha strúhanie mrkvy
	this.instance_4 = new lib.Tween42("synched",0);
	this.instance_4.setTransform(84.6,-313.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_4).to({startPosition:0},34).to({scaleX:1.02,scaleY:1.02,y:-313.7},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(48));

	// Strúhaná Mrkva
	this.instance_5 = new lib.strúhanámrkva();
	this.instance_5.setTransform(-36.9,10.1,1,1,0,0,0,21.4,11.8);
	this.instance_5._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(30).to({_off:false},0).to({x:-34,y:28.8},4).to({x:-36.9,y:10.1},4).to({x:-34,y:28.8},4).to({x:-36.9,y:10.1},4).to({x:-34,y:28.8},4).to({x:-36.9,y:10.1},4).to({x:-34,y:28.8},4).to({x:-36.9,y:10.1},4).to({alpha:0},4).to({_off:true},1).wait(37));

	// Mrkva
	this.instance_6 = new lib.Mrkvalvl1();
	this.instance_6.setTransform(-149.2,57.1,1,1,0,0,0,35.4,6.4);

	this.timeline.addTween(cjs.Tween.get(this.instance_6).to({rotation:3},1).to({rotation:-3,y:57.2},4).to({rotation:2,y:57.1},3).to({rotation:-1,y:57.2},3).to({rotation:0,y:57.1},3).to({regX:35.5,rotation:158,x:-48.3,y:13.5},15).to({_off:true},1).wait(74));

	// Pravé Dvere
	this.instance_7 = new lib.Pravédvereobj();
	this.instance_7.setTransform(125,153.7,1,1,0,0,0,105.6,8.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_7).to({regX:106.6,regY:53.5,x:126,y:198.6},58).to({regX:106.5,scaleX:0.07},12,cjs.Ease.get(-0.6)).to({_off:true},1).wait(12).to({_off:false},0).to({regX:106.6,scaleX:1},11,cjs.Ease.get(-0.6)).wait(10));

	// Strúhadlo
	this.instance_8 = new lib.struhadlonastôl();
	this.instance_8.setTransform(16.6,36.2,1,1,0,0,0,16.4,32.1);

	this.timeline.addTween(cjs.Tween.get(this.instance_8).to({regY:62.7,rotation:-2,y:66.9},1).to({rotation:2,x:16.5,y:66.8},4).to({regY:62.8,rotation:-1,y:66.9},3).to({regY:62.6,rotation:1,y:66.8},3).to({regY:62.7,rotation:0,x:16.6,y:66.9},3).to({regY:62.8,rotation:-6,x:-59.1,y:51.9},16).wait(36).to({rotation:0,x:91,y:213.7},18).wait(20));

	// Mrkva drobky
	this.instance_9 = new lib.mrkvadrobky1();
	this.instance_9.setTransform(-57.8,50.3,1,1,0,0,0,5.9,12.4);
	this.instance_9._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_9).wait(33).to({_off:false},0).to({y:75},6).to({_off:true},1).wait(1).to({_off:false,y:50.3},0).to({y:75},6).to({_off:true},1).wait(1).to({_off:false,y:50.3},0).to({y:75},6).to({_off:true},1).wait(1).to({_off:false,y:50.3},0).to({y:75},6).to({_off:true},1).wait(40));

	// Kopka Mrkvy
	this.instance_10 = new lib.kopkamrkvy();
	this.instance_10.setTransform(-56.3,76.1,0.729,0.729,0,0,0,23.9,14.7);
	this.instance_10.alpha = 0;
	this.instance_10._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_10).wait(33).to({_off:false},0).to({alpha:1},6).wait(6).to({regY:14.8,scaleX:0.76,scaleY:0.76,y:76.2},3).wait(5).to({scaleX:0.8,scaleY:0.8,x:-56.2},3).wait(5).to({scaleX:0.9,scaleY:0.9,x:-56.3,y:76.1},3).wait(20).to({x:39.8,y:56.9},10,cjs.Ease.get(-0.6)).wait(10));

	// Tanier
	this.instance_11 = new lib.Taniernastôl();
	this.instance_11.setTransform(-57.4,81.3,1,1,0,0,0,37.2,13.3);

	this.timeline.addTween(cjs.Tween.get(this.instance_11).to({rotation:-2},2).to({rotation:2,x:-57.3},3).to({regX:37.3,rotation:-1},3).to({regX:37.2,rotation:1,x:-57.4},3).to({rotation:0},3).wait(70).to({x:38.7,y:62},10,cjs.Ease.get(-0.6)).wait(10));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-184.6,-361.6,312.1,614.8);


(lib.struhanámrkva = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("tanier_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// Nastúhaná Mrkva
	this.instance = new lib.kopkamrkvy();
	this.instance.setTransform(56.2,23.2,0.9,0.9,0,0,0,23.9,14.8);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({rotation:-2,x:56.4},1).to({rotation:2,x:56.1},4).to({rotation:-1,x:56.3},3).to({rotation:1,x:56.1},3).to({rotation:0,x:56.2},3).wait(1));

	// Zelený tanier
	this.instance_1 = new lib.Tween10("synched",0);
	this.instance_1.setTransform(56.1,21);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({rotation:-2,x:56.2},1).to({rotation:2,x:56},4).to({rotation:-1,x:56.2},3).to({rotation:1,x:56.1},3).to({rotation:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(27,9.9,58,15.9);


(lib.Struhadlolvl1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":34});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_28 = function() {
		playSound("struhadlo_stol");
	}
	this.frame_99 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(14).call(this.frame_14).wait(14).call(this.frame_28).wait(71).call(this.frame_99).wait(1));

	// Layer 4
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(68,68,68,0.004)").s().p("AopHpIAAvRIRTAAIAAPRg");
	this.shape.setTransform(-7.3,73.8);
	this.shape._off = true;

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(42).to({_off:false},0).to({_off:true},50).wait(8));

	// Layer 3
	this.instance = new lib.Tween144();
	this.instance.setTransform(-22.1,65.1,1,1,0,0,0,67.5,45.4);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(52).to({_off:false},0).to({x:-41.4,y:48.3},7).to({x:-22.1,y:65.1},9).to({x:-35.1,y:50.8},7).wait(12).to({_off:true},1).wait(12));

	// Layer 2
	this.instance_1 = new lib.Tween143();
	this.instance_1.setTransform(-372.6,-155.7,1,1,0,0,0,39.4,47.6);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(36).to({_off:false},0).to({x:-61.6,y:63.8},15,cjs.Ease.get(-1)).to({_off:true},1).wait(36).to({_off:false},0).to({x:-372.6,y:-155.7},10,cjs.Ease.get(-1)).to({_off:true},1).wait(1));

	// úloha
	this.instance_2 = new lib.Tween32("synched",0);
	this.instance_2.setTransform(-292.9,-461.7);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({startPosition:0},34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:-360,alpha:0},16).to({_off:true},1).wait(44));

	// Stúhadlo na stôl
	this.instance_3 = new lib.struhadlonastôl();
	this.instance_3.setTransform(19.4,67.2,1,1,0,0,0,16.4,62.7);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).to({regY:62.6,rotation:-2,y:67.1},1).to({regY:62.7,rotation:2},4).to({rotation:-1,x:19.5,y:67.2},3).to({rotation:1,x:19.4},3).to({regY:60.2,rotation:0,y:64.7},3).to({regX:17.2,regY:33,x:-5.4,y:-175.1},10,cjs.Ease.get(-0.6)).to({regX:16.4,regY:32.1,rotation:360,x:-54.2,y:-110.7},10,cjs.Ease.get(-0.6)).wait(66));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-331,-502.7,367,570.2);


(lib.soľlvl4 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("sol_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// Soľ
	this.instance = new lib.Soľtween("synched",0);
	this.instance.setTransform(17,0.3);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({rotation:-3,x:16.8},1).to({rotation:2,x:17.2},4).to({rotation:-2,x:16.9},3).to({rotation:1,x:17.1},3).to({rotation:0,x:17},3).wait(1));

	// Soľ mysa
	this.instance_1 = new lib.soľmyskatween("synched",0);
	this.instance_1.setTransform(17.1,7.9);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({rotation:-3,x:17.3},1).to({rotation:2,x:17},4).to({rotation:-2,x:17.2},3).to({rotation:1,x:17},3).to({rotation:0,x:17.1},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,-5.3,34,19.2);


(lib.soľ = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":34});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_23 = function() {
		playSound("sol_na_stol");
	}
	this.frame_55 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(14).call(this.frame_14).wait(9).call(this.frame_23).wait(32).call(this.frame_55).wait(1));

	// úloha soľ
	this.instance = new lib.Tween45();
	this.instance.setTransform(0,-483.2);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0,mode:"synched",startPosition:0},16).wait(1));

	// Soľ
	this.instance_1 = new lib.Soľtween("synched",0);
	this.instance_1.setTransform(9.7,13.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({rotation:-3,x:9.5},1).to({rotation:2,x:9.9},4).to({rotation:-2,x:9.6},3).to({rotation:1,x:9.8},3).to({rotation:0,x:9.7},3).to({x:29.8,y:-101.1},12,cjs.Ease.get(-1)).to({x:60.4,y:-122.2},8,cjs.Ease.get(-0.6)).to({rotation:-2,x:60.3},2).to({rotation:-1,x:60.4},2).to({startPosition:0},2).to({startPosition:0},15).wait(1));

	// Soľ mysa
	this.instance_2 = new lib.soľmyskatween("synched",0);
	this.instance_2.setTransform(9.8,21);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({rotation:-3,x:10},1).to({rotation:2,x:9.6},4).to({rotation:-2,x:9.9},3).to({rotation:1,x:9.7},3).to({rotation:0,x:9.8},3).to({x:29.8,y:-93.5},12,cjs.Ease.get(-1)).to({x:60.4,y:-114.6},8,cjs.Ease.get(-0.6)).to({rotation:-2,x:60.6},2).to({rotation:-1,x:60.5},2).to({startPosition:0},2).to({startPosition:0},15).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-44,-523.1,88,550.2);


(lib.siruplvl12 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("olej_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// sirup
	this.instance = new lib.Tween11copy2("synched",0);
	this.instance.setTransform(56.5,41.1,1.283,1.283,0,0,0,0,22.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regX:0.1,rotation:-2,x:56.6},1).to({regX:-0.1,rotation:2,x:56.4},4).to({regX:0,rotation:-1,x:56.5},3).to({rotation:1},3).to({rotation:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(40.1,-16.7,32.8,57.9);


(lib.siruplvl14 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("olej_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// sirup
	this.instance = new lib.Tween11copy2("synched",0);
	this.instance.setTransform(26.2,25.8,2.05,2.05,0,0,0,0,22.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({rotation:-2},1).to({rotation:2},4).to({rotation:-1},3).to({rotation:1},3).to({rotation:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,-66,52.4,92.4);


(lib.siruplvl13 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":100});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("olej_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
		playSound("zatka");
	}
	this.frame_32 = function() {
		playSound("sirup_sa_leje");
	}
	this.frame_115 = function() {
		playSound("zatka");
	}
	this.frame_121 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(18).call(this.frame_32).wait(83).call(this.frame_115).wait(6).call(this.frame_121).wait(1));

	// úloha sirup
	this.instance = new lib.Tween97("synched",0);
	this.instance.setTransform(58.4,-335.9);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({startPosition:0},29).to({startPosition:0},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(71));

	// vylievanie
	this.instance_1 = new lib.Tween107("synched",0);
	this.instance_1.setTransform(-39.5,59,1,0.068,0,0,0,-0.1,-30.8);
	this.instance_1.alpha = 0;
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(31).to({_off:false},0).to({regY:-31.1,scaleY:1.05,alpha:1},15).to({skewX:-4},18).to({skewX:1},18).to({skewX:-2},18).to({regY:-30.8,scaleX:0.71,scaleY:0.07,skewX:0,alpha:0},10).to({_off:true},1).wait(11));

	// sirup bez vrchnáku poz
	this.instance_2 = new lib.Tween106("synched",0);
	this.instance_2.setTransform(3.5,28.9,1,1,5.9);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(26).to({_off:false},0).to({rotation:-24,x:5.9,y:56.9},5).to({startPosition:0},15).to({startPosition:0},18).to({startPosition:0},18).to({startPosition:0},18).to({startPosition:0},10).to({rotation:0,x:3.5,y:28.9},3).to({_off:true},1).wait(8));

	// naplnajuci sa sirup
	this.instance_3 = new lib.Tween108("synched",0);
	this.instance_3.setTransform(-37.5,124.8,0.358,0.153,0,0,0,0,4);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(64).to({_off:false},0).to({regY:4.2,scaleX:1,scaleY:1},32).to({startPosition:0},14).to({startPosition:0},11).wait(1));

	// sirup bez vrchnáku
	this.instance_4 = new lib.Tween105("synched",0);
	this.instance_4.setTransform(46.4,63);
	this.instance_4._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(15).to({_off:false},0).to({scaleX:1,scaleY:1,rotation:-34.1,x:15.9,y:-2.5},5).to({scaleX:1,scaleY:1,rotation:-70,x:3.5,y:23.4},5).to({_off:true},1).wait(88).to({_off:false,rotation:-72.9},0).to({rotation:-0.5,x:15.6,y:62.9},6).to({_off:true},1).wait(1));

	// sirup
	this.instance_5 = new lib.Tween11copy2("synched",0);
	this.instance_5.setTransform(46.3,107.9,2.05,2.05,0,0,0,0,22.4);

	this.timeline.addTween(cjs.Tween.get(this.instance_5).to({rotation:-2},1).to({rotation:2},4).to({rotation:-1},3).to({rotation:1},3).to({rotation:0},3).to({_off:true},1).wait(106).to({_off:false,x:15.9},0).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(20.2,-376.5,76.2,485.1);


(lib.sirup = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":34});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("olej_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_35 = function() {
		playSound("olej_neg");
	}
	this.frame_50 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(21).call(this.frame_35).wait(15).call(this.frame_50).wait(1));

	// úloha sirup
	this.instance = new lib.Tween94("synched",0);
	this.instance.setTransform(229.1,-482.2);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({startPosition:0},29).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).wait(1));

	// sirup
	this.instance_1 = new lib.Tween11copy2("synched",0);
	this.instance_1.setTransform(29,66.4,1.283,1.283,0,0,0,0,22.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({startPosition:0},1).to({rotation:-1},4).to({rotation:1},3).to({rotation:-1},3).to({rotation:0},3).to({regY:22.7,x:91.1,y:-71.7},13).to({regY:22.6,x:151.4,y:-107.6},7).to({rotation:1},3).to({rotation:-0.5},2).to({rotation:0},2).to({startPosition:0},9).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(12.7,-522.2,254.4,588.7);


(lib.rúra13lvl = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(14).call(this.frame_14).wait(1));

	// rúra
	this.instance = new lib.Rúratweencopy("synched",0);
	this.instance.setTransform(161.2,225.9,2.052,2.052,0,0,0,0,53.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({scaleY:2},1).to({scaleY:2.05},4).to({scaleY:2},3).to({scaleY:2.05},3).to({startPosition:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(2.3,6,240.4,48.3);


(lib.Rúra = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("rura_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// Rúra
	this.instance = new lib.Rúratween();
	this.instance.setTransform(77.9,107.3,1,1,0,0,0,0,53.6);
	this.instance.cache(-79,-55,159,111);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({mode:"synched",startPosition:0},1).to({scaleY:0.97},4).to({scaleY:1},3).to({scaleY:0.97},3).to({scaleY:1},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0.5,0.2,155,107);


(lib.ruravakcií = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":170});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_30 = function() {
		playSound("suflik_neg");
	}
	this.frame_53 = function() {
		playSound("rura_pecie");
	}
	this.frame_61 = function() {
		playSound("rura_neg");
	}
	this.frame_62 = function() {
		playSound("muffinova_forma_von");
	}
	this.frame_76 = function() {
		playSound("vazurue_hlb");
	}
	this.frame_195 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(14).call(this.frame_14).wait(16).call(this.frame_30).wait(23).call(this.frame_53).wait(8).call(this.frame_61).wait(1).call(this.frame_62).wait(14).call(this.frame_76).wait(119).call(this.frame_195).wait(1));

	// Maska pekarik (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	mask.graphics.p("Au6S/MAAAgl9Id1AAMAAAAl9g");
	mask.setTransform(-30.4,-405.2);

	// usta
	this.instance = new lib.Tween123("synched",0);
	this.instance.setTransform(-74.6,-390.9,0.85,0.47,3.5);
	this.instance._off = true;

	this.instance.mask = mask;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(76).to({_off:false},0).to({scaleX:1.14,scaleY:1.14,rotation:-9.5,x:-75.5,y:-390.5},4).to({scaleX:0.96,scaleY:0.96,y:-391.6},4).to({regX:1.8,regY:2.3,scaleX:0.63,scaleY:0.55,rotation:-27.7,x:-71,y:-389},3).to({regX:0,regY:0,scaleX:1,scaleY:1,rotation:-25.2,x:-76.1,y:-393},3).to({scaleX:0.52,scaleY:0.58,rotation:-27.7,x:-75.8,y:-390.9},3).to({startPosition:0},4).to({_off:true},1).wait(98));

	// usmev
	this.instance_1 = new lib.Tween126("synched",0);
	this.instance_1.setTransform(-79.9,-398.4);
	this.instance_1._off = true;

	this.instance_1.mask = mask;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(111).to({_off:false},0).to({rotation:-14.5,x:-79.5,y:-397.1},23).to({rotation:-26.4,x:-120,y:-404.5},10).to({rotation:-40.6,x:-179.3,y:-419.2},15).to({_off:true},1).wait(36));

	// Layer 1
	this.instance_2 = new lib.Tween140("synched",0);
	this.instance_2.setTransform(-202.8,-470.2);
	this.instance_2._off = true;

	this.instance_2.mask = mask;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(55).to({_off:false},0).to({rotation:33,x:-68.1,y:-452.5},14).to({rotation:40,x:-60.8,y:-446.9},7).to({rotation:38,x:-63.2,y:-449.6},7).to({rotation:40,x:-60.8,y:-446.9},6).to({rotation:33,x:-68.1,y:-452.5},8).to({rotation:35,y:-453.2},19).to({rotation:31,x:-72.3},18).to({rotation:0,x:-202.8,y:-470.2},25).to({_off:true},1).wait(36));

	// Pekar telo
	this.instance_3 = new lib.Tween125("synched",0);
	this.instance_3.setTransform(-199.6,-362.4,1,1,-35.2);
	this.instance_3._off = true;

	this.instance_3.mask = mask;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(55).to({_off:false},0).to({rotation:0,x:-126.5,y:-361.9},14).to({startPosition:0},65).to({rotation:-35.2,x:-199.6,y:-362.4},25).to({_off:true},1).wait(36));

	// úloha drvička
	this.instance_4 = new lib.Tween95("synched",0);
	this.instance_4.setTransform(226.3,-461.9);

	this.timeline.addTween(cjs.Tween.get(this.instance_4).to({startPosition:0},195).wait(1));

	// úloha sirup
	this.instance_5 = new lib.Tween94("synched",0);
	this.instance_5.setTransform(126.3,-461.9);

	this.timeline.addTween(cjs.Tween.get(this.instance_5).to({startPosition:0},195).wait(1));

	// úloha von z rúry
	this.instance_6 = new lib.Tween91("synched",0);
	this.instance_6.setTransform(14.8,-472.9,1.061,1.042);
	this.instance_6._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(170).to({_off:false},0).to({startPosition:0},2).to({_off:true},1).wait(23));

	// úloha čas 2/3
	this.instance_7 = new lib.Tween90("synched",0);
	this.instance_7.setTransform(14,-450.2,1,1.087);
	this.instance_7._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_7).wait(152).to({_off:false},0).to({startPosition:0},20).to({_off:true},1).wait(23));

	// úloha čas 1/3
	this.instance_8 = new lib.Tween89("synched",0);
	this.instance_8.setTransform(38,-450.4,1.009,1.042);
	this.instance_8._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_8).wait(134).to({_off:false},0).to({startPosition:0},38).to({_off:true},1).wait(23));

	// úloha von z rúry
	this.instance_9 = new lib.Tween88();
	this.instance_9.setTransform(31,-469.6,1.018,1.018);

	this.instance_10 = new lib.Tween93();
	this.instance_10.setTransform(30.9,-469.6,0.98,0.98);
	this.instance_10._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_9).wait(68).to({scaleX:1.04,scaleY:1.04},6).to({scaleX:1,scaleY:1},15).to({scaleX:1.03,scaleY:1.03},15).to({scaleX:1,scaleY:1},13).wait(55).to({_off:true,scaleX:0.98,scaleY:0.98,x:30.9},1).wait(23));
	this.timeline.addTween(cjs.Tween.get(this.instance_10).wait(172).to({_off:false},1).to({scaleX:1.03,scaleY:1.03},5).to({scaleX:0.98,scaleY:0.98},5).to({scaleX:1.03,scaleY:1.03},5).to({scaleX:1,scaleY:1},6).to({_off:true},1).wait(1));

	// úloha do rúry
	this.instance_11 = new lib.Tween87();
	this.instance_11.setTransform(-73.4,-469.2);

	this.timeline.addTween(cjs.Tween.get(this.instance_11).wait(34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(140));

	// Kamen backround
	this.instance_12 = new lib.Toolbarzoom_1();
	this.instance_12.setTransform(76.7,-457.7,1,1,0,0,0,202.5,68.8);

	this.timeline.addTween(cjs.Tween.get(this.instance_12).to({_off:true},195).wait(1));

	// Rúra
	this.instance_13 = new lib.Rúratween("synched",0);
	this.instance_13.setTransform(77.3,107.3,1,1,0,0,0,0,53.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_13).to({startPosition:0},1).to({scaleY:0.97},4).to({scaleY:1},3).to({scaleY:0.97},3).to({scaleY:1},3).to({regY:53.5,scaleY:0.3},25).to({startPosition:0},23).to({regY:53.6,scaleY:1},14).to({startPosition:0},118).to({_off:true},1).wait(1));

	// fiktívna 3D rúra
	this.instance_14 = new lib.Tween24("synched",0);
	this.instance_14.setTransform(77.2,2.1);
	this.instance_14._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_14).wait(14).to({_off:false},0).to({y:73.4},25).to({startPosition:0},23).to({y:2.1},14).to({startPosition:0},118).to({_off:true},1).wait(1));

	// Osvetlenie rúry
	this.instance_15 = new lib.Rúralight();
	this.instance_15.setTransform(77.3,58.6,1,1,0,0,0,69.2,41.9);
	this.instance_15.alpha = 0.301;
	this.instance_15._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_15).wait(15).to({_off:false},0).to({alpha:0.371},61).to({alpha:0.301},12).to({alpha:0.371},12).to({alpha:0.301},12).to({alpha:0.371},12).to({alpha:0.301},12).to({alpha:0.371},12).to({alpha:0.301},12).to({alpha:0.371},12).to({alpha:0.301},12).wait(10).to({_off:true},1).wait(1));

	// Upečené muffinové férmi
	this.instance_16 = new lib.Tween25("synched",0);
	this.instance_16.setTransform(77.6,53.2);
	this.instance_16.alpha = 0;
	this.instance_16._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_16).wait(100).to({_off:false},0).to({alpha:1},60).to({startPosition:0},34).to({_off:true},1).wait(1));

	// Maffinová forma plná 01
	this.instance_17 = new lib.Tween9("synched",0);
	this.instance_17.setTransform(90.3,-79);

	this.timeline.addTween(cjs.Tween.get(this.instance_17).to({startPosition:0},39).to({scaleX:1.1,scaleY:1.1,x:93.3,y:-21.9},11).to({scaleX:0.91,scaleY:0.91,x:77.5,y:54.5},12).to({startPosition:0},14).to({startPosition:0},83).to({_off:true},1).wait(36));

	// Background rúry
	this.instance_18 = new lib.Bitmap90();
	this.instance_18.setTransform(-0.2,0.2);

	this.timeline.addTween(cjs.Tween.get(this.instance_18).to({_off:true},195).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-125.8,-526.5,405,633.7);


(lib.replaybutton = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":29});

	// timeline functions:
	this.frame_0 = function() {
		//this.stop();
	}
	this.frame_29 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(29).call(this.frame_29).wait(1));

	// Layer 1
	this.instance = new lib.Tween135("synched",0);
	this.instance.setTransform(12.3,-40.2,0.1,0.1,-0.5);
	this.instance.alpha = 0;

	this.timeline.addTween(cjs.Tween.get(this.instance).to({scaleX:1.02,scaleY:1.02,rotation:0.5,alpha:1},5).to({scaleX:0.99,scaleY:0.99,rotation:-0.5},4).to({scaleX:1.01,scaleY:1.01,rotation:0.5},4).to({scaleX:1,scaleY:1,rotation:0},3).to({startPosition:0},1).to({scaleX:1,scaleY:1,rotation:0.5},5).to({scaleX:1,scaleY:1,rotation:-0.5},7).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(4.9,-47.6,15,14.9);


(lib.pravédvere = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":39});

	// timeline functions:
	this.frame_0 = function() {
		//this.stop();
	}
	this.frame_11 = function() {
		playSound("dvere_zatvor");
	}
	this.frame_39 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(11).call(this.frame_11).wait(28).call(this.frame_39).wait(1));

	// Pravé dvere
	this.instance = new lib.Pravédvereobj();
	this.instance.setTransform(108.1,54.2,0.05,1,0,0,0,107,54);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(24).to({_off:false},0).to({regX:107.5,scaleX:1},15,cjs.Ease.get(-0.6)).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = null;


(lib.PravédvereLVL3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		playSound("dvere_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(3).call(this.frame_3).wait(11).call(this.frame_14).wait(1));

	// Pravé dvere lvl 3
	this.instance = new lib.Pravédvereobj();
	this.instance.setTransform(109.5,17.5,1,1,0,0,0,105.5,13.1);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({scaleX:0.97},1,cjs.Ease.get(-0.6)).to({scaleX:1},4,cjs.Ease.get(-0.6)).to({scaleX:0.97},3,cjs.Ease.get(-0.6)).to({scaleX:1},3,cjs.Ease.get(-0.6)).wait(4));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(4,4.4,107,108);


(lib.Pravédvere = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":19});

	// timeline functions:
	this.frame_0 = function() {
		//this.stop();
	}
	this.frame_1 = function() {
		playSound("dvere_otvor_2");
	}
	this.frame_25 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(24).call(this.frame_25).wait(1));

	// Layer 3
	this.instance = new lib.Pravédvereobj();
	this.instance.setTransform(108.2,55.8,1,1,0,0,0,107.5,55.1);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regX:106.9,scaleX:0.08},19).to({_off:true},1).wait(6));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0.7,0.7,107,108);


(lib.pasueScreen = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		this.stop();
		
		if (somVmenu == 1)
		{
			this.bmenu.visible = false;
		}
		
		else { this.bmenu.visible = true; }
		
		var openPause = this;
		
		this.bcontinue.on("click", pauseF2);
		
		
		function pauseF2(evt) 	
		{
			PokiSDK.gameplayStart();
			openPause.gotoAndStop(0);
			createjs.Ticker.addEventListener("tick", stage);
			stage.update();
		}
				
				
		this.bmenu.on("click", menuF);
		
		
		function menuF(evt) 
		{
			console.log("menuF")
			openPause.gotoAndStop(0);
			stopujI();
			createjs.Ticker.addEventListener("tick", stage);
			stage.removeAllChildren();
			stage.addChild(exportRoot.menucko);
			//stage.addChild(exportRoot.pauseScreen);
			stage.update();
			somVmenu = 1;
			playCommercial();
		}
				
				
				
		this.tt_4.text = t_lang[chosenL][3][0];
		this.tt_4.font = t_lang[chosenL][3][1];
		this.tt_4.color = t_lang[chosenL][3][2];
		this.tt_4.lineHeight = t_lang[chosenL][3][3];
		this.tt_4.lineWidth = t_lang[chosenL][3][4];
		this.tt_4.maxWidth = t_lang[chosenL][3][5];
		this.tt_4.textAlign = t_lang[chosenL][3][6];
		this.tt_4.textBaseline = t_lang[chosenL][3][7];
		this.tt_4.rotation = t_lang[chosenL][3][8];
		if ((t_lang[chosenL][3][9]) != null && 
			(t_lang[chosenL][3][10]) != null)
		{	
			this.tt_4.x = t_lang[chosenL][3][9];
			this.tt_4.y = t_lang[chosenL][3][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(1));

	// buttons
	this.bcontinue = new lib.l1b4();
	this.bcontinue.setTransform(157.4,510.4,1.363,1.423,0,0,0,-0.1,0.6);
	new cjs.ButtonHelper(this.bcontinue, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bmenu = new lib.l1b4();
	this.bmenu.setTransform(156.4,260.4,1.363,1.423,0,0,0,-0.1,0.6);
	new cjs.ButtonHelper(this.bmenu, 0, 1, 2, false, new lib.l1b4(), 3);

	this.instance = new lib.continuebutton();
	this.instance.setTransform(213.5,565,1,1,0,0,0,70.1,32.3);

	this.instance_1 = new lib.menu_btn();
	this.instance_1.setTransform(212.5,315,1,1,0,0,0,70.1,32.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_1},{t:this.instance},{t:this.bmenu},{t:this.bcontinue}]},1).wait(1));

	// text
	this.tt_4 = new cjs.Text("PAUSE", "96px 'Rancho'", "#FBEDD2");
	this.tt_4.name = "tt_4";
	this.tt_4.textAlign = "center";
	this.tt_4.lineHeight = 104;
	this.tt_4.lineWidth = 389;
	this.tt_4.setTransform(200.7,3.8,1.003,1.003);
	this.tt_4._off = true;

	this.timeline.addTween(cjs.Tween.get(this.tt_4).wait(1).to({_off:false},0).wait(1));

	// bg
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(0,0,0,0.6)").s().p("EgfoA4QMAAAhwfMA/RAAAMAAABwfg");
	this.shape.setTransform(202.5,360);
	this.shape._off = true;

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(1).to({_off:false},0).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = null;


(lib.orangejuice = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("olej_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// Pomarančovýdžús 01
	this.instance = new lib.Tween11("synched",0);
	this.instance.setTransform(2.6,49,1,1,0,0,0,0,22.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({rotation:-2,y:49.1},1).to({rotation:2},4).to({rotation:-1,y:49},3).to({rotation:1},3).to({rotation:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-10.2,4,26,45);


(lib.Olejlvl8 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("olej_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// Olej
	this.instance = new lib.Olejobj();
	this.instance.setTransform(14.6,52.6,1,1,0,0,0,10.8,68.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({rotation:-2},1).to({rotation:2,y:52.7},4).to({rotation:-1,y:52.6},3).to({rotation:1},3).to({rotation:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(3.8,-15.9,22,69);


(lib.Olejlvl7 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":77});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("olej_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_15 = function() {
		playSound("zatka");
	}
	this.frame_49 = function() {
		playSound("olej_tecie");
	}
	this.frame_93 = function() {
		playSound("zatka");
	}
	this.frame_97 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1).call(this.frame_15).wait(34).call(this.frame_49).wait(44).call(this.frame_93).wait(4).call(this.frame_97).wait(1));

	// úloha miešanie
	this.instance = new lib.Tween83("synched",0);
	this.instance.setTransform(-346.1,-468.3);
	this.instance._off = true;

	this.instance_1 = new lib.Tween84("synched",0);
	this.instance_1.setTransform(53.5,-468.3);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(59).to({_off:false},0).to({_off:true,rotation:360,x:53.5},21).wait(18));
	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(59).to({_off:false,rotation:720},21).to({startPosition:0},17).wait(1));

	// úloha maffinová forma
	this.instance_2 = new lib.Tween82("synched",0);
	this.instance_2.setTransform(-346,-468.3);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(64).to({_off:false},0).to({rotation:360,x:-46},22).to({startPosition:0},11).wait(1));

	// úloha vareška
	this.instance_3 = new lib.Tween81("synched",0);
	this.instance_3.setTransform(-346,-468.2);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(69).to({_off:false},0).to({rotation:360,x:-145.9},22).to({startPosition:0},6).wait(1));

	// úloha mlieko
	this.instance_4 = new lib.Tween80();
	this.instance_4.setTransform(-346.1,-465.7);
	this.instance_4._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(74).to({_off:false},0).to({rotation:360,x:-246.1},22).to({_off:true},1).wait(1));

	// toolbar maska (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	var mask_graphics_0 = new cjs.Graphics().p("A5FLHIAA2NMAyMAAAIAAWNg");

	this.timeline.addTween(cjs.Tween.get(mask).to({graphics:mask_graphics_0,x:-145.7,y:-466.9}).wait(97).to({graphics:null,x:0,y:0}).wait(1));

	// toolbar pod mlieko
	this.instance_5 = new lib.Toolbarzoom_1();
	this.instance_5.setTransform(-95.3,-465.2,1,1,0,0,0,202.5,68.8);

	this.instance_5.mask = mask;

	this.timeline.addTween(cjs.Tween.get(this.instance_5).to({_off:true},97).wait(1));

	// úloha olej
	this.instance_6 = new lib.Tween76();
	this.instance_6.setTransform(53.4,-473);

	this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(42));

	// Tekúci olej
	this.instance_7 = new lib.Tween6("synched",0);
	this.instance_7.setTransform(-102.2,-138.3,1.186,0.088,0,0,0,0,-15.4);
	this.instance_7._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_7).wait(44).to({_off:false},0).to({regY:-15.2,scaleY:1.19},5).to({regX:0.1,skewX:1},5).to({regX:0,skewX:0},5).to({regX:0.1,skewX:1},5).to({regX:0,skewX:-1},5).to({regY:-15.4,scaleY:0.06,x:-102.4,y:-147.2},5).to({_off:true},1).wait(23));

	// Olej vodorovne
	this.instance_8 = new lib.Tween5("synched",0);
	this.instance_8.setTransform(-45.5,-159.1);
	this.instance_8._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_8).wait(31).to({_off:false},0).to({rotation:-40,x:-69,y:-143},13).to({scaleX:1,scaleY:1,rotation:-40.1},25).to({scaleX:1,scaleY:1,rotation:-20},7).to({_off:true},1).wait(21));

	// Olej na ceste
	this.instance_9 = new lib.Tween4("synched",0);
	this.instance_9.setTransform(17.4,29.3);
	this.instance_9._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_9).wait(15).to({_off:false},0).to({rotation:-60,x:-46,y:-160.8},16).to({_off:true},1).wait(45).to({_off:false,rotation:-80,x:-69.9,y:-143.9},0).to({rotation:0,x:17.1,y:28.9},16).to({_off:true},1).wait(4));

	// Olej
	this.instance_10 = new lib.Olejobj();
	this.instance_10.setTransform(17.3,62.7,1,1,0,0,0,10.8,68.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_10).to({rotation:-2,y:62.6},1).to({rotation:2,y:62.7},4).to({rotation:-1,y:62.6},3).to({rotation:1,y:62.7},3).to({rotation:0},3).to({_off:true},1).wait(79).to({_off:false,x:17.1,y:62.3},0).wait(4));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-297.8,-534,389.6,597.2);


(lib.olej = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("drvicka_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// Drvič
	this.instance = new lib.Tween1("synched",0);
	this.instance.setTransform(72.9,32.9);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({rotation:-3},1).to({rotation:3},4).to({rotation:-2},3).to({rotation:1},3).to({rotation:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(56.7,18,32,30);


(lib.myskavelká = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("miska_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// Veľká myska
	this.instance = new lib.plnámysacopy();
	this.instance.setTransform(53.2,54.1,1.283,1.283,0,0,0,38.7,41.1);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regX:38.8,regY:41,rotation:-1,x:53.3,y:54},1,cjs.Ease.get(-0.7)).to({regX:38.7,regY:41.1,rotation:1},4,cjs.Ease.get(-0.7)).to({rotation:-0.5,x:53.2,y:54.1},3,cjs.Ease.get(-0.7)).to({regY:41,rotation:0.5,y:54},3,cjs.Ease.get(-0.7)).to({regY:41.1,rotation:0,y:54.1},3,cjs.Ease.get(-0.7)).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(3.6,1.4,100.1,52.6);


(lib.myskalvl9 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":114});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_15 = function() {
		playSound("lizacka_von");
	}
	this.frame_39 = function() {
		playSound("vylievanie_do_formy");
	}
	this.frame_108 = function() {
		playSound("lizacka_spat");
	}
	this.frame_114 = function() {
		this.stop();
		console.log('myskalvl9');
		PokiSDK.happyTime(0.5);
		exportLevel();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(14).call(this.frame_14).wait(1).call(this.frame_15).wait(24).call(this.frame_39).wait(69).call(this.frame_108).wait(6).call(this.frame_114).wait(1));

	// úloha drvička
	this.instance = new lib.Tween95("synched",0);
	this.instance.setTransform(-332.8,-338.4);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(59).to({_off:false},0).to({rotation:360,x:67.2},21).to({startPosition:0},34).wait(1));

	// úloha sirup
	this.instance_1 = new lib.Tween94("synched",0);
	this.instance_1.setTransform(-332.7,-338.4);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(64).to({_off:false},0).to({rotation:360,x:-32.7},21).to({startPosition:0},29).wait(1));

	// úloha von z rúry
	this.instance_2 = new lib.Tween88();
	this.instance_2.setTransform(-328,-346);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(69).to({_off:false},0).to({rotation:360,x:-128},21).wait(25));

	// úloha rúra stupne
	this.instance_3 = new lib.Tween87();
	this.instance_3.setTransform(-332.4,-345.6);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(74).to({_off:false},0).to({rotation:360,x:-232.4},21).wait(20));

	// úloha vylízatko
	this.instance_4 = new lib.Tween84("synched",0);
	this.instance_4.setTransform(66.6,-337.4);

	this.timeline.addTween(cjs.Tween.get(this.instance_4).to({x:66.2},34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(59));

	// Lízátko 2nd pos
	this.instance_5 = new lib.Lízátko2ndpos();
	this.instance_5.setTransform(-219.7,-17.2,0.999,0.999,0,0,0,11.9,46.2);
	this.instance_5._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(16).to({_off:false},0).to({rotation:77.2,x:-168.7,y:-83.4},11).to({regY:46.3,scaleX:1,scaleY:1,rotation:100,x:-93.5,y:-36.8},12).to({_off:true},1).wait(53).to({_off:false,x:-32.1,y:-19.2},0).to({regY:46.2,scaleX:1,scaleY:1,rotation:77.2,x:-168.7,y:-83.4},8).to({regY:46.3,scaleX:1,scaleY:1,rotation:0,x:-218.5,y:-14.1},7,cjs.Ease.get(-0.7)).to({_off:true},1).wait(6));

	// Lízátko 1st pos
	this.instance_6 = new lib.Lízatko();
	this.instance_6.setTransform(-218.6,-19.3,1,1,0,0,0,4.2,41);

	this.instance_7 = new lib.Lízátko3rdposition();
	this.instance_7.setTransform(-95.2,-26.2,1,1,0,0,0,44.2,17.9);
	this.instance_7._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(15).to({_off:true},1).wait(93).to({_off:false,regY:40.9,rotation:-4,y:-19.4},0).to({rotation:3,x:-218.5},3).to({regY:41,rotation:0,x:-218.6,y:-19.3},2).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.instance_7).wait(40).to({_off:false},0).to({x:-122.3,y:-8},13).to({x:-73.6,y:-21.3},13).to({x:-69.5,y:-5.9},13).to({x:-28.6,y:-12.5},13).to({_off:true},1).wait(22));

	// Muffiníky
	this.instance_8 = new lib.muffin11();
	this.instance_8.setTransform(-35.8,34.7,0.8,0.8,0,0,0,11.8,2.7);
	this.instance_8.alpha = 0;
	this.instance_8._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_8).wait(94).to({_off:false},0).to({alpha:1},4).wait(17));

	// Muffiníky
	this.instance_9 = new lib.muffin11();
	this.instance_9.setTransform(-32,40.4,0.9,0.9,0,0,0,11.8,2.7);
	this.instance_9.alpha = 0;
	this.instance_9._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_9).wait(93).to({_off:false},0).to({alpha:1},4).wait(18));

	// Muffiníky
	this.instance_10 = new lib.muffin11();
	this.instance_10.setTransform(-29.1,47.3,1,1,0,0,0,11.8,2.7);
	this.instance_10.alpha = 0;
	this.instance_10._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_10).wait(92).to({_off:false},0).to({alpha:1},4).wait(19));

	// Muffiníky
	this.instance_11 = new lib.muffin11();
	this.instance_11.setTransform(-58,34.7,0.8,0.8,0,0,0,11.8,2.7);
	this.instance_11.alpha = 0;
	this.instance_11._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_11).wait(80).to({_off:false},0).to({alpha:1},4).wait(31));

	// Muffiníky
	this.instance_12 = new lib.muffin11();
	this.instance_12.setTransform(-56.5,40.4,0.9,0.9,0,0,0,11.8,2.7);
	this.instance_12.alpha = 0;
	this.instance_12._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_12).wait(79).to({_off:false},0).to({alpha:1},4).wait(32));

	// Muffiníky
	this.instance_13 = new lib.muffin11();
	this.instance_13.setTransform(-55.4,47.3,1,1,0,0,0,11.8,2.7);
	this.instance_13.alpha = 0;
	this.instance_13._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_13).wait(78).to({_off:false},0).to({alpha:1},4).wait(33));

	// Muffiníky
	this.instance_14 = new lib.muffin11();
	this.instance_14.setTransform(-80.8,34.7,0.8,0.8,0,0,0,11.8,2.7);
	this.instance_14.alpha = 0;
	this.instance_14._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_14).wait(68).to({_off:false},0).to({alpha:1},4).wait(43));

	// Muffiníky
	this.instance_15 = new lib.muffin11();
	this.instance_15.setTransform(-81.6,40.2,0.9,0.9,0,0,0,11.8,2.7);
	this.instance_15.alpha = 0;
	this.instance_15._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_15).wait(67).to({_off:false},0).to({x:-82,y:40.4,alpha:1},4).wait(44));

	// Muffiníky
	this.instance_16 = new lib.muffin11();
	this.instance_16.setTransform(-82.8,47.3,1,1,0,0,0,11.8,2.7);
	this.instance_16.alpha = 0;
	this.instance_16._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_16).wait(66).to({_off:false},0).to({alpha:1},4).wait(45));

	// Muffiníky
	this.instance_17 = new lib.muffin11();
	this.instance_17.setTransform(-103.2,34.7,0.8,0.8,0,0,0,11.8,2.7);
	this.instance_17.alpha = 0;
	this.instance_17._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_17).wait(55).to({_off:false},0).to({alpha:1},4).wait(56));

	// Muffiníky
	this.instance_18 = new lib.muffin11();
	this.instance_18.setTransform(-106.4,40.2,0.9,0.9,0,0,0,11.8,2.7);
	this.instance_18.alpha = 0;
	this.instance_18._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_18).wait(54).to({_off:false},0).to({alpha:1},4).wait(57));

	// Muffiníky
	this.instance_19 = new lib.muffin11();
	this.instance_19.setTransform(-109.3,47.3,1,1,0,0,0,11.8,2.7);
	this.instance_19.alpha = 0;
	this.instance_19._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_19).wait(53).to({_off:false},0).to({alpha:1},4).wait(58));

	// Miešanica
	this.instance_20 = new lib.Tween66("synched",0);
	this.instance_20.setTransform(8.4,17.5,1,1,0,0,0,-31.1,1.4);

	this.timeline.addTween(cjs.Tween.get(this.instance_20).to({rotation:-2,x:8.1,y:18.6},1).to({rotation:2,x:8.8,y:16.5},4).to({rotation:-1,x:8.2,y:18.1},3).to({regX:-31,regY:1.5,rotation:1,x:8.7,y:17.1},3).to({regX:-31.1,regY:1.6,rotation:0,x:8.4,y:17.7},3).to({regX:-30.9,regY:1.5,rotation:-35,x:-99.4,y:17.3},18,cjs.Ease.get(-0.7)).to({y:17.4},21).to({scaleX:0.87,scaleY:0.74,rotation:-33.6,x:-72.2},13).to({regY:1.6,scaleX:0.52,scaleY:0.31,rotation:-30.8,x:-17.7,y:17.5},26).to({alpha:0},6).to({_off:true},1).wait(16));

	// Vylievanie
	this.instance_21 = new lib.vylievané();
	this.instance_21.setTransform(-96.1,13.5,0.112,0.068,1.5,0,0,21.2,5.7);
	this.instance_21._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_21).wait(40).to({_off:false},0).to({regX:21,regY:5.9,scaleX:0.81,scaleY:0.8},13).to({regY:6,scaleX:0.6,scaleY:0.83,x:-83.7},5).to({regY:5.9,scaleX:0.81,scaleY:0.8,x:-68.8},8).to({regX:21.1,scaleX:0.6,scaleY:0.83,x:-56.5,y:13.6},5).to({regX:21,scaleX:0.81,scaleY:0.8,x:-41.6,y:13.5},8).to({regX:20.9,regY:6,scaleX:0.6,scaleY:0.81,x:-29.4,y:15},5).to({regX:21,scaleX:0.78,scaleY:0.77,x:-14.6,y:15.3},8).to({regX:21.1,scaleX:0.46,scaleY:0.45,rotation:-24.1,x:-22.1,y:31.2,alpha:0},3).to({_off:true},1).wait(19));

	// Myska
	this.instance_22 = new lib.plnámysa();
	this.instance_22.setTransform(38.8,27.8,1,1,0,0,0,38.7,20.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_22).wait(14).to({regX:38.6,rotation:-35,x:-68.9,y:8.3},18,cjs.Ease.get(-0.7)).to({regX:38.7,scaleX:1,scaleY:1,rotation:-35.1,x:-68.8},21,cjs.Ease.get(-0.7)).to({regX:38.6,scaleX:1,scaleY:1,rotation:-35,x:12.8},39).to({regX:38.7,scaleX:1,scaleY:1,rotation:-35.1,x:12.9,y:8.4},6,cjs.Ease.get(-0.7)).to({regX:38.8,scaleX:1,scaleY:1,rotation:3,x:38.9,y:27.8},9).to({regX:38.7,rotation:-2,x:38.8},4,cjs.Ease.get(-0.7)).to({rotation:0},3,cjs.Ease.get(-0.7)).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-222.8,-383,327.4,431.2);


(lib.Myska = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":39});

	// timeline functions:
	this.frame_0 = function() {
		//this.stop();
	}
	this.frame_39 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(39).call(this.frame_39).wait(1));

	// Soľ
	this.instance = new lib.Soľtween("synched",0);
	this.instance.setTransform(-172.4,28.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({x:45.3,y:220.5},24,cjs.Ease.get(-1)).to({startPosition:0},15,cjs.Ease.get(-1)).wait(1));

	// Soľ mysa
	this.instance_1 = new lib.soľmyskatween("synched",0);
	this.instance_1.setTransform(-172.3,36);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({x:45.4,y:228},24,cjs.Ease.get(-1)).to({startPosition:0},15,cjs.Ease.get(-1)).wait(1));

	// Myska
	this.instance_2 = new lib.plnámysa();
	this.instance_2.setTransform(39,32.7,1,1,0,0,0,38.7,20.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(14).to({x:-80.2,y:90.3},10,cjs.Ease.get(-0.7)).to({rotation:-2,x:-217.9,y:213.5},9,cjs.Ease.get(-0.7)).to({regX:38.6,regY:20.7,rotation:1,x:-218},2).to({regX:38.7,regY:20.6,rotation:-1,x:-217.9},2).to({rotation:0},2).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-189.4,12.1,267.7,41);


(lib.muffinováformalvl9 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":33});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("muffinova_forma_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_35 = function() {
		playSound("muffinova_forma_von");
	}
	this.frame_55 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(21).call(this.frame_35).wait(20).call(this.frame_55).wait(1));

	// úloha maffinová forma
	this.instance = new lib.Tween82("synched",0);
	this.instance.setTransform(-41.1,-539.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({x:-41.3},34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).wait(1));

	// Muffinová forma
	this.instance_1 = new lib.Tween3("synched",0);
	this.instance_1.setTransform(47.4,19);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({scaleX:1.02},1).to({scaleX:1},4).to({scaleX:1.02,scaleY:1.01},3).to({scaleX:0.98,scaleY:1},3).to({scaleX:1},3).to({rotation:-0.3,x:-2.2,y:-51.2},11).to({scaleX:1.5,scaleY:1.5,rotation:-1,x:-76.9,y:-157.1},8).to({rotation:1},3,cjs.Ease.get(-1)).to({rotation:0},3).to({y:-157},16).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-88.8,-579.4,175.5,606.2);


(lib.Muffinováforma = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("muffinova_forma_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// Muffinová forma
	this.instance = new lib.Tween3("synched",0);
	this.instance.setTransform(43.9,12.8);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({scaleX:1.04},4).to({scaleX:1},3).to({scaleX:1.02},3).to({scaleX:1},4).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(5.1,4.6,78,16);


(lib.Mrkvanapoličke = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":83});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("mrkva_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_26 = function() {
		playSound("mrkva_stol");
	}
	this.frame_46 = function() {
		playSound("EheeheHlb");
	}
	this.frame_111 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(12).call(this.frame_26).wait(20).call(this.frame_46).wait(65).call(this.frame_111).wait(1));

	// Layer 2
	this.shape = new cjs.Shape();
	this.shape.graphics.f("rgba(68,68,68,0.004)").s().p("Egh7AoLMAAAhQVMBD3AAAMAAABQVg");
	this.shape.setTransform(-83.2,-181.8);
	this.shape._off = true;

	this.timeline.addTween(cjs.Tween.get(this.shape).wait(43).to({_off:false},0).to({_off:true},64).wait(5));

	// Maska (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	var mask_graphics_36 = new cjs.Graphics().p("EgfqAstMAAAhZZMA/VAAAMAAABZZg");
	var mask_graphics_110 = new cjs.Graphics().p("EgfqAstMAAAhZZMA/VAAAMAAABZZg");

	this.timeline.addTween(cjs.Tween.get(mask).to({graphics:null,x:0,y:0}).wait(36).to({graphics:mask_graphics_36,x:-91.8,y:-251.1}).wait(74).to({graphics:mask_graphics_110,x:-91.8,y:-251.1}).wait(1).to({graphics:null,x:0,y:0}).wait(1));

	// ruka
	this.instance = new lib.Tween120("synched",0);
	this.instance.setTransform(327.5,-214.2,1,1,-20,0,0,113.2,-72.5);
	this.instance._off = true;

	this.instance.mask = mask;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(36).to({_off:false},0).to({regX:114.4,regY:-70.9,rotation:-3.8,x:195.9,y:-315.6},13).to({rotation:-11,x:196},14).to({rotation:-3.8,x:195.9},10).to({rotation:-16},10).to({rotation:-3.8},7).to({rotation:-16},7).to({regX:113.2,regY:-72.5,rotation:-20,x:327.5,y:-164.2},13).to({_off:true},1).wait(1));

	// Kucharik telo
	this.instance_1 = new lib.Tween139("synched",0);
	this.instance_1.setTransform(222.8,-269.9);
	this.instance_1._off = true;

	this.instance_1.mask = mask;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(36).to({_off:false},0).to({rotation:-36,x:76.3,y:-299.9},13).to({rotation:-35,x:78.8,y:-300.9},14).to({rotation:-34,x:87.5,y:-305.5},10).to({rotation:-37,x:78.8,y:-299.4},10).to({rotation:-34,x:87.5,y:-305.5},7).to({rotation:-37,x:78.8,y:-299.4},7).to({rotation:0,x:222.8,y:-219.9},13).to({_off:true},1).wait(1));

	// úloha mrkva
	this.instance_2 = new lib.Tween37("synched",0);
	this.instance_2.setTransform(-142,-507.9);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({startPosition:0},34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(56));

	// Mrkva lvl1
	this.instance_3 = new lib.Mrkvalvl1();
	this.instance_3.setTransform(37.3,13.4,1,1,0,0,0,35.4,6.4);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).to({rotation:4,y:13.5},1).to({rotation:-3,y:13.4},4).to({rotation:2,y:13.5},3).to({regX:35.5,rotation:-1,y:13.4},3).to({regX:35.4,rotation:0},3).to({x:-31.5,y:-30.1},5,cjs.Ease.get(-0.6)).to({rotation:360,x:-169.7,y:-135.8},10,cjs.Ease.get(-0.6)).wait(83));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-189,-547.9,261.9,567.9);


(lib.mliekolvl8 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("mlieko_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// Mlieko
	this.instance = new lib.Mliekoobj();
	this.instance.setTransform(17.2,56.1,1,1,0,0,0,17.3,48.1);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({rotation:-2,x:17.3},1).to({regX:17.4,rotation:2},4).to({regX:17.3,rotation:-1,x:17.2},3).to({rotation:1},3).to({rotation:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-0.1,8,35,48);


(lib.Mlieko = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":110});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("mlieko_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_44 = function() {
		playSound("mlieko_tecie");
	}
	this.frame_104 = function() {
		playSound("mlieko_na_policku");
	}
	this.frame_110 = function() {
		this.stop();
		console.log('Mlieko');
		exportLevel();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(30).call(this.frame_44).wait(60).call(this.frame_104).wait(6).call(this.frame_110).wait(1));

	// úloha mlieko
	this.instance = new lib.Tween80();
	this.instance.setTransform(-289.9,-460.2);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},11).to({_off:true},1).wait(60));

	// Mlieko 2
	this.instance_1 = new lib.Mliekoobj();
	this.instance_1.setTransform(14.3,67.4,1,1,0,0,0,17.3,48.1);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({regX:17.4,rotation:-2,x:14.4},1).to({regX:17.3,rotation:2,x:14.3},4).to({rotation:-1},3).to({rotation:1},3).to({rotation:0},3).to({regX:17.2,rotation:-65,x:-81.8,y:-128.9},20).to({rotation:-70},5).wait(5).to({regX:17.3,scaleX:1,scaleY:1,x:-81.9,y:-129.1},49).to({regX:17.2,scaleX:1,scaleY:1,x:-81.8,y:-128.9},1).to({regX:17.3,rotation:0,x:14.3,y:67.4},10).to({regX:17.4,rotation:-2,x:14.4},2).to({regY:48.2,rotation:1},2).to({regY:48.1,rotation:0},2).wait(1));

	// Tečúce mlieko
	this.instance_2 = new lib.Tween7("synched",0);
	this.instance_2.setTransform(-132.4,-134.3,1,0.205,0,0,0,-0.1,-18.8);
	this.instance_2.alpha = 0;
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(39).to({_off:false},0).to({regY:-18.7,scaleY:1,x:-135.8,y:-134.1,alpha:1},5).to({regY:-18.8,skewX:2},5).to({regY:-18.7,skewX:0},5).to({regY:-18.8,skewX:2},5).to({regY:-18.7,skewX:0},5).to({regY:-18.8,skewX:2},5).to({regY:-18.7,skewX:0},5).to({regY:-18.8,skewX:2},5).to({startPosition:0},5).to({regX:0.1,regY:-18.9,scaleX:0.1,scaleY:0.33,skewX:18.8,skewY:16.8,x:-130.1,y:-136.3,alpha:0},5).to({_off:true},1).wait(21));

	// Náplň mysky
	this.instance_3 = new lib.Tween8("synched",0);
	this.instance_3.setTransform(-143.3,-96.4,0.479,0.161,0,0,0,0.1,4);
	this.instance_3.alpha = 0;
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(44).to({_off:false},0).to({y:-96.6,alpha:1},5).to({scaleX:1,scaleY:1,x:-143.7,y:-96.3},35).to({startPosition:0},26).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-328,-502.7,360,570);


(lib.miešanievarechou = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":112});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
		playSound("vareska_von");
	}
	this.frame_39 = function() {
		playSound("miesanie_mixu");
	}
	this.frame_108 = function() {
		playSound("vareska_von");
	}
	this.frame_112 = function() {
		this.stop();
		console.log('miešanievarechou');
		exportLevel();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(14).call(this.frame_14).wait(25).call(this.frame_39).wait(69).call(this.frame_108).wait(4).call(this.frame_112).wait(1));

	// úloha vylížátka
	this.instance = new lib.Tween84("synched",0);
	this.instance.setTransform(199.2,-348.9);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({startPosition:0},112).wait(1));

	// úloha maffinová forma
	this.instance_1 = new lib.Tween82("synched",0);
	this.instance_1.setTransform(99.9,-348.9);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({startPosition:0},112).wait(1));

	// úloha vareška
	this.instance_2 = new lib.Tween81("synched",0);
	this.instance_2.setTransform(-0.2,-348.9);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({startPosition:0},34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(57));

	// vareska1
	this.instance_3 = new lib.varechV();
	this.instance_3.setTransform(-98.3,-43.5,0.839,0.839,164.2,0,0,10,35.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).to({rotation:162},1).to({rotation:166},4).to({regY:35.4,rotation:162},3).to({regY:35.5,rotation:166},3).to({rotation:164.2},3).to({_off:true},1).wait(98));

	// vareskoa
	this.instance_4 = new lib.Tween67("synched",0);
	this.instance_4.setTransform(44.4,-37.2);
	this.instance_4._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(39).to({_off:false},0).to({rotation:5,x:49.1,y:-32.1},1).to({x:62.2,y:-31},2).to({x:36.8,y:-31.3},6).to({x:62.2,y:-31},7).to({x:36.8,y:-31.3},6).to({x:62.2,y:-31},7).to({x:36.8,y:-31.3},6).to({x:62.2,y:-31},7).to({x:49.1,y:-32.1},6).to({_off:true},1).wait(25));

	// miesanica
	this.instance_5 = new lib.Tween55("synched",0);
	this.instance_5.setTransform(46.2,13.4);
	this.instance_5.alpha = 0.398;
	this.instance_5._off = true;

	this.instance_6 = new lib.Tween56("synched",0);
	this.instance_6.setTransform(46.2,13.4);
	this.instance_6.alpha = 0.602;
	this.instance_6._off = true;

	this.instance_7 = new lib.Tween57("synched",0);
	this.instance_7.setTransform(46.1,13.4);
	this.instance_7.alpha = 0.801;
	this.instance_7._off = true;

	this.instance_8 = new lib.Tween58("synched",0);
	this.instance_8.setTransform(46,13.4);
	this.instance_8._off = true;

	this.instance_9 = new lib.Tween59("synched",0);
	this.instance_9.setTransform(46.1,13.4);
	this.instance_9._off = true;

	this.instance_10 = new lib.Tween60("synched",0);
	this.instance_10.setTransform(46,13.4);
	this.instance_10._off = true;

	this.instance_11 = new lib.Tween61("synched",0);
	this.instance_11.setTransform(46.1,13.4);
	this.instance_11._off = true;

	this.instance_12 = new lib.Tween62("synched",0);
	this.instance_12.setTransform(46,13.4);
	this.instance_12._off = true;

	this.instance_13 = new lib.Tween63("synched",0);
	this.instance_13.setTransform(46.1,13.4);
	this.instance_13.alpha = 0.398;
	this.instance_13._off = true;

	this.instance_14 = new lib.Tween64("synched",0);
	this.instance_14.setTransform(46,13.4);
	this.instance_14.alpha = 0.199;
	this.instance_14._off = true;

	this.instance_15 = new lib.Tween65("synched",0);
	this.instance_15.setTransform(46,13.4);
	this.instance_15.alpha = 0;

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance_5}]},40).to({state:[{t:this.instance_6}]},2).to({state:[{t:this.instance_7}]},3).to({state:[{t:this.instance_8}]},3).to({state:[{t:this.instance_9}]},3).to({state:[{t:this.instance_10}]},3).to({state:[{t:this.instance_11}]},3).to({state:[{t:this.instance_12}]},3).to({state:[{t:this.instance_11}]},3).to({state:[{t:this.instance_12}]},3).to({state:[{t:this.instance_13}]},3).to({state:[{t:this.instance_14}]},2).to({state:[{t:this.instance_12}]},3).to({state:[{t:this.instance_11}]},2).to({state:[{t:this.instance_12}]},3).to({state:[{t:this.instance_13}]},3).to({state:[{t:this.instance_14}]},2).to({state:[{t:this.instance_15}]},3).to({state:[]},1).wait(25));
	this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(40).to({_off:false},0).to({_off:true,alpha:0.602},2).wait(71));
	this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(40).to({_off:false},2).to({_off:true,x:46.1,alpha:0.801},3).wait(68));
	this.timeline.addTween(cjs.Tween.get(this.instance_7).wait(42).to({_off:false},3).to({_off:true,x:46,alpha:1},3).wait(65));
	this.timeline.addTween(cjs.Tween.get(this.instance_8).wait(45).to({_off:false},3).to({_off:true,x:46.1},3).wait(62));
	this.timeline.addTween(cjs.Tween.get(this.instance_9).wait(48).to({_off:false},3).to({_off:true,x:46},3).wait(59));
	this.timeline.addTween(cjs.Tween.get(this.instance_10).wait(51).to({_off:false},3).to({_off:true,x:46.1},3).wait(56));
	this.timeline.addTween(cjs.Tween.get(this.instance_11).wait(54).to({_off:false},3).to({_off:true,x:46},3).to({_off:false,x:46.1},3).to({_off:true,x:46},3).wait(8).to({_off:false,x:46.1},2).to({_off:true,x:46},3).wait(34));
	this.timeline.addTween(cjs.Tween.get(this.instance_12).wait(57).to({_off:false},3).to({_off:true,x:46.1},3).to({_off:false,x:46},3).to({_off:true,x:46.1,alpha:0.398},3).wait(2).to({_off:false,x:46,alpha:1},3).to({_off:true,x:46.1},2).to({_off:false,x:46},3).to({_off:true,x:46.1,alpha:0.398},3).wait(31));
	this.timeline.addTween(cjs.Tween.get(this.instance_13).wait(66).to({_off:false},3).to({_off:true,x:46,alpha:0.199},2).wait(8).to({_off:false,x:46.1,alpha:0.398},3).to({_off:true,x:46,alpha:0.199},2).wait(29));
	this.timeline.addTween(cjs.Tween.get(this.instance_14).wait(69).to({_off:false},2).to({_off:true,alpha:1},3).wait(8).to({_off:false,alpha:0.199},2).to({_off:true,alpha:0},3).wait(26));

	// miesa
	this.instance_16 = new lib.statikmiešanica();
	this.instance_16.setTransform(45.8,13.5,1,1,0,0,0,31.1,3.8);

	this.instance_17 = new lib.Tween66("synched",0);
	this.instance_17.setTransform(45.9,13.4);
	this.instance_17._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_16).to({rotation:-3,x:45.9},1).to({rotation:2,y:13.4,alpha:0.949},3).to({rotation:-2},3).to({rotation:1},3).to({rotation:-1,x:45.6,y:13.5},4).to({rotation:-0.8,alpha:0.953},1).to({_off:true},25).wait(73));
	this.timeline.addTween(cjs.Tween.get(this.instance_17).wait(40).to({_off:false},0).to({startPosition:0},29).to({startPosition:0},5).to({startPosition:0},8).to({startPosition:0},5).to({x:172,y:4.5},17,cjs.Ease.get(-0.7)).to({rotation:-1,x:171.8},2).to({rotation:1,x:172.2},3).to({startPosition:0},3).wait(1));

	// vares2
	this.instance_18 = new lib.vareška();
	this.instance_18.setTransform(-104.1,-31.5,1,1,7,0,0,15.1,50.2);
	this.instance_18._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_18).wait(15).to({_off:false},0).to({regX:15,regY:50.1,rotation:56,x:-65.1,y:-120},9).to({regX:15.1,regY:50.2,rotation:190,x:44.3,y:-33.3},14).to({_off:true},1).wait(74));

	// var2
	this.instance_19 = new lib.vareška();
	this.instance_19.setTransform(44.3,-33.3,1,1,-170,0,0,15.1,50.2);
	this.instance_19._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_19).wait(88).to({_off:false},0).to({regX:15,rotation:0,x:-102.9,y:-106.8},11).to({regX:15.1,regY:50.1,x:-99.3,y:-30.2},11).wait(3));

	// Myska
	this.instance_20 = new lib.myskamix();
	this.instance_20.setTransform(45.5,25.1,1,1,0,0,0,38.8,20.6);

	this.instance_21 = new lib.plnámysa();
	this.instance_21.setTransform(45.5,25.1,1,1,0,0,0,38.8,20.6);
	this.instance_21._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_20).to({rotation:-3},1).to({rotation:2},3).to({regX:38.7,rotation:-2,x:45.4},3).to({regX:38.8,regY:20.7,rotation:1,x:45.5,y:25.2},3).to({regY:20.6,rotation:-1,y:25.1},3).to({rotation:0},2).wait(59).to({_off:true},13).wait(26));
	this.timeline.addTween(cjs.Tween.get(this.instance_21).wait(74).to({_off:false},13).to({x:171.6,y:16.2},17,cjs.Ease.get(-0.7)).to({rotation:-1},2,cjs.Ease.get(-0.7)).to({regX:38.6,regY:20.7,rotation:1,x:171.5},3,cjs.Ease.get(-0.7)).wait(4));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-114.5,-395.5,351.7,441);


(lib.Maffinovéformy = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("muffinova_forma_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// maffinová forma
	this.instance = new lib.Tween27copy("synched",0);
	this.instance.setTransform(79.6,18.9,1.283,1.283);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({scaleX:1.3},1).to({scaleX:1.27},4).to({scaleX:1.3},3).to({scaleX:1.28,scaleY:1.27},3).to({scaleY:1.28},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(5,1,149.5,35.9);


(lib.maffinováformalvl13 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":83});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("muffinova_forma_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_33 = function() {
		playSound("muffinova_forma_von");
	}
	this.frame_83 = function() {
		this.stop();
		console.log('maffinováformalvl13');
		PokiSDK.happyTime(0.8);
		exportLevel();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(19).call(this.frame_33).wait(50).call(this.frame_83).wait(1));

	// dekorácia strúhanou mrkvou
	this.instance = new lib.Tween113("synched",0);
	this.instance.setTransform(-295.9,-414.5);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(43).to({_off:false},0).to({rotation:360,x:4.5},20).to({startPosition:0},20).wait(1));

	// polievanie maffinu
	this.instance_1 = new lib.Tween112("synched",0);
	this.instance_1.setTransform(-295.7,-419.3);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(48).to({_off:false},0).to({rotation:360,x:-95.7},20).to({startPosition:0},15).wait(1));

	// úloha tanier s mrkvou
	this.instance_2 = new lib.Tween111("synched",0);
	this.instance_2.setTransform(-296.7,-414.5);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(53).to({_off:false},0).to({rotation:360,x:-196.7},20).to({startPosition:0},10).wait(1));

	// úloha vyber maffin
	this.instance_3 = new lib.Tween99("synched",0);
	this.instance_3.setTransform(99.2,-414.5);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).to({startPosition:0},34).to({scaleX:1.02,scaleY:1.02,x:99.5},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(28));

	// Muffin
	this.instance_4 = new lib.Tween110("synched",0);
	this.instance_4.setTransform(57.1,43.8);
	this.instance_4._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(15).to({_off:false},0).to({x:17.8,y:-8.8},9).to({x:-7.2,y:58.1},9).to({startPosition:0},22).to({startPosition:0},28).wait(1));

	// Maffin výber 1/2
	this.instance_5 = new lib.vybratýmuffinzformy();
	this.instance_5.setTransform(140.6,43.2,1,1,0,0,0,119.2,28.3);
	this.instance_5._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(15).to({_off:false},0).wait(21).to({x:305.4},19).to({_off:true},1).wait(28));

	// Maffinová forma
	this.instance_6 = new lib.Tween27copy("synched",0);
	this.instance_6.setTransform(140.5,42.6,2.05,2.05);

	this.timeline.addTween(cjs.Tween.get(this.instance_6).to({scaleX:2.08},1).to({scaleX:2.04},4).to({scaleX:2.06},3).to({scaleX:2.04},3).to({scaleX:2.05},3).to({_off:true},1).wait(69));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(21.4,-454.5,238.8,525.8);


(lib.maffinlvl14 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(14).call(this.frame_14).wait(1));

	// maffin
	this.instance = new lib.Tween110("synched",0);
	this.instance.setTransform(26.6,6.1);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({startPosition:0},14).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0.9,-11,51.3,34.9);


(lib.ližičkalvl8 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("lizicka_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// Ližička
	this.instance = new lib.Ližičkalvl3();
	this.instance.setTransform(24.2,5.8,1,1,0,0,0,27.2,3.7);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regX:27.3,rotation:-2,x:24.3},1).to({regX:27.2,rotation:2,x:24.2},4).to({regY:3.8,rotation:-1,y:5.9},3).to({regY:3.6,rotation:1,y:5.7},3).to({regY:3.7,rotation:0,y:5.8},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-3,2.1,55,7);


(lib.ližičkalvl7 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":74});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_35 = function() {
		playSound("naber_sypke");
	}
	this.frame_66 = function() {
		playSound("vysyp_sypke");
	}
	this.frame_94 = function() {
		playSound("lizicka_neg");
	}
	this.frame_102 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(14).call(this.frame_14).wait(21).call(this.frame_35).wait(31).call(this.frame_66).wait(28).call(this.frame_94).wait(8).call(this.frame_102).wait(1));

	// úloha soľ
	this.instance = new lib.Tween72();
	this.instance.setTransform(157.9,-378.8);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(47));

	// Padajúca soľ
	this.instance_1 = new lib.Padajúcasoľ();
	this.instance_1.setTransform(92.4,-33.8,1,1,0,0,0,2.2,8.8);
	this.instance_1.alpha = 0;
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(62).to({_off:false},0).to({alpha:1},2).to({x:93.8,y:-24.7},7).to({x:94.5,y:-20.8,alpha:0},3).to({_off:true},1).wait(28));

	// Soľ na ližičke
	this.instance_2 = new lib.Soĺnaližičke();
	this.instance_2.setTransform(18,-17.8,1,1,0,0,0,4,4.3);
	this.instance_2.alpha = 0;
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(39).to({_off:false},0).to({alpha:1},4).to({scaleX:1,scaleY:1,rotation:-27.9,x:90.9,y:-44.8},16).to({scaleX:1,scaleY:1,rotation:-16.8,x:88.3,y:-41.5,alpha:0},5).to({_off:true},1).wait(38));

	// Ližička
	this.instance_3 = new lib.Ližičkalvl3();
	this.instance_3.setTransform(27.2,12.2,1,1,0,0,0,27.2,3.7);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).to({rotation:-2,x:27.3},1).to({regX:27.3,rotation:2},4).to({regX:27.2,regY:3.8,rotation:-1,x:27.2,y:12.3},3).to({regY:3.7,rotation:1,y:12.1},3).to({rotation:0,y:12.2},3).to({regY:3.6,rotation:60,x:-2.9,y:-40.1},15).wait(5).to({x:7.4,y:-36.2},5).wait(4).to({scaleX:1,scaleY:1,rotation:32.1,x:72.9,y:-56},16).to({scaleX:1,scaleY:1,rotation:43.2},5).wait(10).to({regY:3.7,scaleX:1,scaleY:1,rotation:0,x:262.2,y:148.3},20).to({regX:27.3,rotation:-2,x:262.3},2).to({regX:27.2,regY:3.6,rotation:1,x:262.2,y:148.2},2).to({regY:3.8,rotation:-1,y:148.4},2).to({regY:3.7,rotation:0,y:148.3},2).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,-418.8,200.1,434.3);


(lib.ližičkalvl2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":139});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_15 = function() {
		playSound("suflik_otvor");
	}
	this.frame_45 = function() {
		playSound("naber_sypke");
	}
	this.frame_60 = function() {
		playSound("ehe_hlb");
	}
	this.frame_82 = function() {
		playSound("vysyp_sypke");
	}
	this.frame_96 = function() {
		playSound("naber_sypke");
	}
	this.frame_117 = function() {
		playSound("suflik_zatvor");
	}
	this.frame_121 = function() {
		playSound("vysyp_sypke");
	}
	this.frame_134 = function() {
		playSound("lizicka_neg");
	}
	this.frame_139 = function() {
		this.stop();
		console.log('ližičkalvl2');
		PokiSDK.happyTime(0.3);
		exportLevel();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(14).call(this.frame_14).wait(1).call(this.frame_15).wait(30).call(this.frame_45).wait(15).call(this.frame_60).wait(22).call(this.frame_82).wait(14).call(this.frame_96).wait(21).call(this.frame_117).wait(4).call(this.frame_121).wait(13).call(this.frame_134).wait(5).call(this.frame_139).wait(1));

	// úloha olej
	this.instance = new lib.Tween76();
	this.instance.setTransform(-89.9,-439.2);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(75).to({_off:false},0).to({rotation:360,x:309.2},20).wait(45));

	// úloha soľ
	this.instance_1 = new lib.Tween72();
	this.instance_1.setTransform(-88.1,-434.2);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(80).to({_off:false},0).to({rotation:360,x:211.1},20).wait(40));

	// úloha flour
	this.instance_2 = new lib.Tween75();
	this.instance_2.setTransform(-90.1,-434.2);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(85).to({_off:false},0).to({rotation:360,x:109.2},20).wait(35));

	// úloha baking p.
	this.instance_3 = new lib.Tween73();
	this.instance_3.setTransform(-90,-434.2);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(90).to({_off:false},0).to({rotation:360,x:10},20).wait(30));

	// úloha naber cukor
	this.instance_4 = new lib.Tween79();
	this.instance_4.setTransform(309.8,-434.2);

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(84));

	// Sugar šuflík
	this.instance_5 = new lib.Sugartween();
	this.instance_5.setTransform(128.7,3.7);

	this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(14).to({scaleX:1.1,scaleY:1.1,y:4},15).wait(86).to({scaleX:1,scaleY:1},14).to({y:4.3},10).wait(1));

	// Padajúci Cukor
	this.instance_6 = new lib.padajúcicukor();
	this.instance_6.setTransform(156.1,-91.4,1,1,0,0,0,2.2,8.9);
	this.instance_6.alpha = 0;
	this.instance_6._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(74).to({_off:false},0).to({alpha:1},5).to({x:156.8,y:-81.7},6).to({x:157.2,y:-76.8,alpha:0},3).to({_off:true},1).wait(26).to({_off:false,x:156.1,y:-91.4},0).to({alpha:1},5).to({x:156.8,y:-81.7},6).to({x:157.2,y:-76.8,alpha:0},3).to({_off:true},1).wait(10));

	// Cukor na ližičke
	this.instance_7 = new lib.cukornaližičke();
	this.instance_7.setTransform(151.9,-8.4,1,1,0,0,0,6.1,5.3);
	this.instance_7._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_7).wait(60).to({_off:false},0).to({rotation:20,x:150.3,y:-103.1},14).to({alpha:0},5).to({_off:true},1).wait(21).to({_off:false,rotation:0,x:151.9,y:-8.4,alpha:1},0).to({rotation:20,x:150.3,y:-103.1},14).to({alpha:0},5).to({_off:true},1).wait(19));

	// Ližička
	this.instance_8 = new lib.Ližičkalvl3();
	this.instance_8.setTransform(27.3,9.9,1,1,0,0,0,27.3,3.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_8).to({y:10},29).to({rotation:50,x:78.3,y:-55.9},12).to({x:112.9,y:-12.4},7).to({x:134,y:-11.9},6).to({rotation:20,x:133.9,y:-11.8},6).to({rotation:40,x:134.5,y:-112.5},14).wait(10).to({rotation:50,x:112.9,y:-12.4},4).to({x:134,y:-11.9},7).to({rotation:20,x:133.9,y:-11.8},6).to({rotation:40,x:134.5,y:-112.5},14).wait(14).to({regX:27.2,regY:3.7,rotation:0,x:80.5,y:-43},10).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,-474.1,355,493.9);


(lib.ližička = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("lizicka_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(1));

	// Ližička
	this.instance = new lib.Ližičkalvl3();
	this.instance.setTransform(26.3,9.6,1,1,0,0,0,27.3,3.6);

	this.instance_1 = new lib.Ližičkatween("synched",0);
	this.instance_1.setTransform(26.3,9.6,1,1,-2);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).to({_off:true,regX:0,regY:0,rotation:-2,mode:"synched",startPosition:0},1).wait(14));
	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({_off:false},1).to({rotation:2},4).to({rotation:-2},3).to({rotation:1},3).to({rotation:0},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-1,6,55,7);


(lib.functu_logo = function() {
	this.initialize();

	// FlashAICB
	this.instance = new lib.trademark_symbol2();
	this.instance.setTransform(197.3,59.2,1,1,0,0,0,11,11);

	this.shape = new cjs.Shape();
	this.shape.graphics.f("#E95632").s().p("Ah4EkQg1gggcg9QgRglgHgqQgEgWABgRIAAlfQAAgXAPgPQAQgQAWAAQAXAAAPAQQAQAPAAAXIAAFfQAAAjAUAmQAgA+BFAAQBEAAAhg8QAVgmAAglIAAlfQAAgXAQgPQAPgQAXAAQAWAAAQAQQAQAPAAAXIAAFfQAAA8gbA6QgcA9g0AgQg1AhhGAAQhEAAg0ghg");
	this.shape.setTransform(139,125.9);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#E95632").s().p("AglE1QgQgQAAgWIAAnmIiLAAQgWgBgQgQQgQgPAAgXQAAgWAQgQQAQgQAWAAIGAAAQAWAAARAQQAQAQAAAWQAAAXgQAPQgRAQgWABIiKAAIAAHmQAAAWgQAQQgRAQgVAAQgVAAgQgQg");
	this.shape_1.setTransform(84.8,125.9);

	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("#E95632").s().p("AieDlQhfhfAAiGQAAiFBfhgQBghfCEAAQBSAABKAnQATAMAHAUQAGAWgKAUQgLATgWAHQgVAGgUgLQgugag6AAQhXAAhABAQg/BAAABYQAABZA/BAQBAA/BXAAQA6AAAugaQAUgLAVAHQAWAGALAUQAKAUgGAWQgHAUgTAMQhKAnhSAAQiEAAhghgg");
	this.shape_2.setTransform(29.2,125.9);

	this.shape_3 = new cjs.Shape();
	this.shape_3.graphics.f("#E95632").s().p("ACREtIkXmPIAAFxQAAAWgQAQQgRAQgVAAQgXAAgQgQQgPgQAAgWIAAodQAAgWAOgQQARgQAYAAQAMAAALAGQANAHAHAKIEXGQIAAlxQAAgXAQgPQAPgQAYAAQAWAAAQAQQAQAPAAAXIAAIdQAAAWgQAQQgQAQgWAAQgcAAgRgYg");
	this.shape_3.setTransform(-31.1,125.9);

	this.shape_4 = new cjs.Shape();
	this.shape_4.graphics.f("#E95632").s().p("Ah4EkQg1gggdg9QgQglgHgqQgEgXAAgQIAAlfQAAgXAQgPQAQgQAWAAQAXAAAQAQQAPAPAAAXIAAFfQAAAjAUAmQAgA+BFAAQBEAAAhg8QAVgmAAglIAAlfQAAgXAQgPQAQgQAWAAQAWAAAQAQQAQAPAAAXIAAFfQAAA8gaA6QgdA9g0AgQg1AhhGAAQhEAAg0ghg");
	this.shape_4.setTransform(-92,125.9);

	this.shape_5 = new cjs.Shape();
	this.shape_5.graphics.f("#E95632").s().p("AigE1QgQgQAAgWIAAodQAAgXAQgPQAQgQAWAAID0AAQAWAAAQAQQARAPAAAXQAAAWgRARQgQAPgWAAIi9AAIAAB7IClAAQAWABAQAQQAQAPAAAWQAAAXgQAPQgQAPgWgBIilAAIAAECQAAAWgQAQQgRAQgWAAQgWAAgQgQg");
	this.shape_5.setTransform(-140.2,125.9);

	this.shape_6 = new cjs.Shape();
	this.shape_6.graphics.f("#67493E").s().p("AgnATIAAglIBPAAIAAAlg");
	this.shape_6.setTransform(-1.6,-151.7);

	this.shape_7 = new cjs.Shape();
	this.shape_7.graphics.f("#F7D635").s().p("AgCAuQgSgBgNgPQgNgOABgSQABgSAPgNQAOgNASABQASABANAOQANAPgBARQgBATgOAOQgOALgRAAIgCAAg");
	this.shape_7.setTransform(178.7,-190.8);

	this.shape_8 = new cjs.Shape();
	this.shape_8.graphics.f("#67493E").s().p("AgDBLQgggCgVgYQgUgXACgeQACgfAYgVQAXgUAeACQAfACAVAXQAUAYgCAdQgCAggXAUQgWATgcAAIgDAAg");
	this.shape_8.setTransform(178.7,-190.8);

	this.shape_9 = new cjs.Shape();
	this.shape_9.graphics.f("#FFFFFF").s().p("AAABLQgfAAgWgXQgWgWAAgeQABgfAXgWQAWgWAeAAQAfABAWAWQAWAXgBAdQAAAggXAWQgWAWgeAAIAAgBg");
	this.shape_9.setTransform(143.5,6.5);

	this.shape_10 = new cjs.Shape();
	this.shape_10.graphics.f("#F79D3C").s().p("AgfAhQgOgOAAgTQAAgSAOgOQANgNASAAQATAAAOANQANAOAAASQAAATgNAOQgOANgTAAQgSAAgNgNg");
	this.shape_10.setTransform(166.5,-82.1);

	this.shape_11 = new cjs.Shape();
	this.shape_11.graphics.f("#F79D3C").s().p("AgwAxQgUgVgBgcQABgcAUgUQAVgVAbABQAdgBAUAVQAVAUgBAcQABAcgVAVQgUAUgdAAQgbAAgVgUg");
	this.shape_11.setTransform(148.4,-28.9);

	this.shape_12 = new cjs.Shape();
	this.shape_12.graphics.f("#67493E").s().p("Ag+A/QgbgbAAgkQAAgkAbgaQAbgaAjAAQAlAAAbAaQAZAaAAAkQAAAkgZAbQgbAbglAAQgjAAgbgbg");
	this.shape_12.setTransform(178.7,-190.8);

	this.shape_13 = new cjs.Shape();
	this.shape_13.graphics.f("#FFFFFF").s().p("AhoBpQgsgsAAg9QAAg8AsgsQArgsA9AAQA9AAAsAsQAsAsAAA8QAAA9gsAsQgsAsg9AAQg9AAgrgsg");
	this.shape_13.setTransform(178.7,-190.8);

	this.shape_14 = new cjs.Shape();
	this.shape_14.graphics.f("#67493E").s().p("Ag+A/QgbgaAAglQAAgkAbgaQAbgbAjAAQAlAAAbAbQAZAaAAAkQAAAlgZAaQgbAbglAAQgjAAgbgbg");
	this.shape_14.setTransform(178.7,-128.7);

	this.shape_15 = new cjs.Shape();
	this.shape_15.graphics.f("#FFFFFF").s().p("AhRBSQgigiAAgwQAAgvAigiQAigiAvAAQAwAAAiAiQAiAiAAAvQAAAwgiAiQgiAigwAAQgvAAgigig");
	this.shape_15.setTransform(178.7,-128.7);

	this.shape_16 = new cjs.Shape();
	this.shape_16.graphics.f("#FFFFFF").s().p("AgcAdQgNgMAAgRQAAgQANgNQAMgMAQAAQARAAAMAMQANANAAAQQAAARgNAMQgMANgRAAQgQAAgMgNg");
	this.shape_16.setTransform(72.9,-0.9);

	this.shape_17 = new cjs.Shape();
	this.shape_17.graphics.f("#67493E").s().p("Ag3A4QgYgXAAghQAAggAYgXQAXgYAgAAQAhAAAXAYQAYAXAAAgQAAAhgYAXQgXAYghAAQggAAgXgYg");
	this.shape_17.setTransform(72.9,-0.9);

	this.shape_18 = new cjs.Shape();
	this.shape_18.graphics.f("#67493E").s().p("AgUBuIAAjbIApAAIAADbg");
	this.shape_18.setTransform(59.6,-47.8);

	this.shape_19 = new cjs.Shape();
	this.shape_19.graphics.f("#67493E").s().p("AgREIIAAoPIAjAAIAAIPg");
	this.shape_19.setTransform(87.3,19.1);

	this.shape_20 = new cjs.Shape();
	this.shape_20.graphics.f("#67493E").s().p("AgREIIAAoPIAjAAIAAIPg");
	this.shape_20.setTransform(73.1,5.9);

	this.shape_21 = new cjs.Shape();
	this.shape_21.graphics.f("#67493E").s().p("AhCBWQgPAAgLgKQgLgJAAgPIAAhoQAAgNALgJQALgKAPAAICFAAQAPAAALAKQALAJAAANIAABoQAAAPgLAJQgLAKgPAAg");
	this.shape_21.setTransform(-2.3,-3.5);

	this.shape_22 = new cjs.Shape();
	this.shape_22.graphics.f("#67493E").s().p("AhsCLQgYAAgSgQQgRgQAAgWIAAipQAAgXARgPQASgQAYAAIDZAAQAZAAARAQQARAPAAAXIAACpQAAAWgRAQQgSAQgYAAg");
	this.shape_22.setTransform(-2.1,-52.9);

	this.shape_23 = new cjs.Shape();
	this.shape_23.graphics.f("#E95632").s().p("AiVCWQg/g+AAhYQAAhXA/g+QA+g/BXAAQBYAAA+A/QA/A+AABXQAABYg/A+Qg+A/hYAAQhXAAg+g/g");
	this.shape_23.setTransform(-2.6,-3.2);

	this.shape_24 = new cjs.Shape();
	this.shape_24.graphics.f("#67493E").s().p("Ag+A/QgbgaAAglQAAgkAbgaQAagbAkAAQAlAAAaAbQAbAaAAAkQAAAlgbAaQgaAbglAAQgkAAgagbg");
	this.shape_24.setTransform(-35.1,-178.2);

	this.shape_25 = new cjs.Shape();
	this.shape_25.graphics.f("#67493E").s().p("Ag+BAQgbgbAAglQAAgkAbgaQAagaAkAAQAlAAAaAaQAbAaAAAkQAAAlgbAbQgaAaglAAQgkAAgagag");
	this.shape_25.setTransform(31.4,-178.2);

	this.shape_26 = new cjs.Shape();
	this.shape_26.graphics.f("#FFFFFF").s().p("AgcAeQgNgNAAgRQAAgQANgNQAMgMAQAAQARAAAMAMQANANAAAQQAAARgNANQgMAMgRAAQgQAAgMgMg");
	this.shape_26.setTransform(86.1,52.5);

	this.shape_27 = new cjs.Shape();
	this.shape_27.graphics.f("#67493E").s().p("Ag3A5QgYgYAAghQAAggAYgYQAXgXAgAAQAhAAAXAXQAYAYAAAgQAAAhgYAYQgXAXghAAQggAAgXgXg");
	this.shape_27.setTransform(86.1,52.5);

	this.shape_28 = new cjs.Shape();
	this.shape_28.graphics.f("#E95632").s().p("AgoApQgSgQAAgZQAAgXASgRQARgSAXAAQAZAAARASQARARAAAXQAAAZgRAQQgRASgZAAQgXAAgRgSg");
	this.shape_28.setTransform(78.2,-99.6);

	this.shape_29 = new cjs.Shape();
	this.shape_29.graphics.f("#67493E").s().p("AhOBPQghghAAguQAAgtAhghQAhghAtAAQAuAAAhAhQAhAhAAAtQAAAughAhQghAhguAAQgtAAghghg");
	this.shape_29.setTransform(78.2,-99.6);

	this.shape_30 = new cjs.Shape();
	this.shape_30.graphics.f("#E95632").s().p("AgoApQgSgRAAgYQAAgXASgRQARgSAXAAQAZAAAQASQASARAAAXQAAAYgSARQgQASgZAAQgXAAgRgSg");
	this.shape_30.setTransform(69.8,-28.9);

	this.shape_31 = new cjs.Shape();
	this.shape_31.graphics.f("#67493E").s().p("AhOBPQghghAAguQAAguAhggQAhgiAtAAQAuAAAhAiQAhAgAAAuQAAAughAhQghAigugBQgtABghgig");
	this.shape_31.setTransform(69.8,-28.9);

	this.shape_32 = new cjs.Shape();
	this.shape_32.graphics.f("#FFFFFF").s().p("AguAvQgTgUAAgbQAAgaATgUQAUgTAaAAQAbAAAUATQATAUAAAaQAAAbgTAUQgUATgbAAQgaAAgUgTg");
	this.shape_32.setTransform(128.8,-46.9);

	this.shape_33 = new cjs.Shape();
	this.shape_33.graphics.f("#67493E").s().p("AhYBYQgkglAAgzQAAgzAkgkQAlglAzAAQAzAAAlAlQAlAkAAAzQAAAzglAlQglAmgzAAQgzAAglgmg");
	this.shape_33.setTransform(128.8,-46.9);

	this.shape_34 = new cjs.Shape();
	this.shape_34.graphics.f("#FFFFFF").s().p("AgiAjQgPgPAAgUQAAgTAPgPQAPgPATAAQAUAAAPAPQAPAPAAATQAAAUgPAPQgPAPgUAAQgTAAgPgPg");
	this.shape_34.setTransform(60.3,-65.4);

	this.shape_35 = new cjs.Shape();
	this.shape_35.graphics.f("#67493E").s().p("AhCBDQgcgcAAgnQAAgmAcgcQAcgcAmAAQAnAAAbAcQAcAcAAAmQAAAngcAcQgbAcgnAAQgmAAgcgcg");
	this.shape_35.setTransform(60.3,-65.4);

	this.shape_36 = new cjs.Shape();
	this.shape_36.graphics.f("#FFFFFF").s().p("AgcAdQgNgMAAgRQAAgQANgNQAMgMAQAAQARAAAMAMQANANAAAQQAAARgNAMQgMANgRAAQgQAAgMgNg");
	this.shape_36.setTransform(72.9,39.3);

	this.shape_37 = new cjs.Shape();
	this.shape_37.graphics.f("#67493E").s().p("Ag3A4QgYgXAAghQAAggAYgXQAXgYAgAAQAhAAAXAYQAYAXAAAgQAAAhgYAXQgXAYghAAQggAAgXgYg");
	this.shape_37.setTransform(72.9,39.3);

	this.shape_38 = new cjs.Shape();
	this.shape_38.graphics.f("#FFFFFF").s().p("AgsAuQgUgTAAgbQAAgaAUgTQASgTAaAAQAbAAATATQATATAAAaQAAAbgTATQgTATgbAAQgaAAgSgTg");
	this.shape_38.setTransform(-1.9,49.7);

	this.shape_39 = new cjs.Shape();
	this.shape_39.graphics.f("#67493E").s().p("AgyAzQgVgVAAgeQAAgcAVgWQAVgVAdgBQAeABAVAVQAVAWAAAcQAAAegVAVQgVAVgeAAQgdAAgVgVg");
	this.shape_39.setTransform(9.7,-168.6);

	this.shape_40 = new cjs.Shape();
	this.shape_40.graphics.f("#67493E").s().p("AgyAzQgVgVAAgeQAAgcAVgWQAVgVAdgBQAeABAVAVQAVAWAAAcQAAAegVAVQgVAVgeAAQgdAAgVgVg");
	this.shape_40.setTransform(-13,-168.6);

	this.shape_41 = new cjs.Shape();
	this.shape_41.graphics.f("#80C4A7").s().p("AgPAQQgHgHAAgJQAAgIAHgHQAHgHAIAAQAJAAAHAHQAHAHAAAIQAAAJgHAHQgHAHgJAAQgIAAgHgHg");
	this.shape_41.setTransform(42.3,-23.9);

	this.shape_42 = new cjs.Shape();
	this.shape_42.graphics.f("#80C4A7").s().p("AgUAVQgJgJAAgMQAAgMAJgIQAJgJALAAQANAAAIAJQAJAKAAAKQAAANgJAIQgJAJgMAAQgMAAgIgJg");
	this.shape_42.setTransform(104.1,-42);

	this.shape_43 = new cjs.Shape();
	this.shape_43.graphics.f("#80C4A7").s().p("AgiAiQgOgPAAgTQABgUAOgOQAPgOASAAQAVABAOAOQAOAPAAASQgBAUgOAPQgPAOgTAAQgUgBgOgOg");
	this.shape_43.setTransform(91.2,-41.5);

	this.shape_44 = new cjs.Shape();
	this.shape_44.graphics.f("#FFFFFF").s().p("AAAArQgRAAgNgNQgMgNAAgRQAAgRANgNQANgMAQAAQATAAAMANQAMANAAAQQAAASgNANQgNAMgRAAIAAAAg");
	this.shape_44.setTransform(97.2,-60.1);

	this.shape_45 = new cjs.Shape();
	this.shape_45.graphics.f("#67493E").s().p("AAABGQgdAAgVgVQgUgVAAgcQABgdAVgUQAVgVAcABQAdAAAVAVQAUAVAAAcQgBAdgVAUQgVAVgcAAIAAgBg");
	this.shape_45.setTransform(97.2,-60);

	this.shape_46 = new cjs.Shape();
	this.shape_46.graphics.f("#67493E").s().p("ABKCSIiXgBQgfgBgWgXQgWgVABggIACiMQABgfAWgVQAWgWAfAAICXADQAfAAAWAWQAWAWgBAfIgCCNQAAAegXAXQgVAVgeAAIgCgBg");
	this.shape_46.setTransform(96.5,-45);

	this.shape_47 = new cjs.Shape();
	this.shape_47.graphics.f("#FFFFFF").s().p("AgeAeQgNgMABgSQgBgRANgNQANgNARABQASgBAMANQANANABARQgBASgNAMQgMAOgSAAQgRAAgNgOg");
	this.shape_47.setTransform(-1.3,-125);

	this.shape_48 = new cjs.Shape();
	this.shape_48.graphics.f("#85C4AC").s().p("AgeAfQgNgNABgSQgBgRANgNQANgNARAAQASAAAMANQANANABARQgBASgNANQgMANgSAAQgRAAgNgNg");
	this.shape_48.setTransform(-1.3,-103);

	this.shape_49 = new cjs.Shape();
	this.shape_49.graphics.f("#85C4AC").s().p("AgdAfQgNgNgBgSQABgRANgNQAMgNARAAQARAAAOANQANANgBARQABASgNANQgOANgRAAQgRAAgMgNg");
	this.shape_49.setTransform(-12.8,-103);

	this.shape_50 = new cjs.Shape();
	this.shape_50.graphics.f("#E95632").s().p("AgeAfQgNgNABgSQgBgRANgMQANgNARgBQASABAMANQANAMABARQgBASgNANQgMANgSAAQgRAAgNgNg");
	this.shape_50.setTransform(-1.3,-113.9);

	this.shape_51 = new cjs.Shape();
	this.shape_51.graphics.f("#E95632").s().p("AgdAfQgNgNgBgSQABgRANgMQAMgNARgBQARABAOANQANAMgBARQABASgNANQgOANgRAAQgRAAgMgNg");
	this.shape_51.setTransform(-12.8,-113.9);

	this.shape_52 = new cjs.Shape();
	this.shape_52.graphics.f("#FFFFFF").s().p("AgdAeQgNgMgBgSQABgRANgNQAMgNARABQARgBAOANQANANgBARQABASgNAMQgOAOgRAAQgRAAgMgOg");
	this.shape_52.setTransform(-12.8,-125);

	this.shape_53 = new cjs.Shape();
	this.shape_53.graphics.f("#F6A93D").s().p("AgdAeQgOgMAAgSQAAgRAOgNQANgNAQAAQASAAANANQANANgBARQABASgNAMQgNANgSABQgQgBgNgNg");
	this.shape_53.setTransform(9.9,-136.6);

	this.shape_54 = new cjs.Shape();
	this.shape_54.graphics.f("#F6A93D").s().p("AgeAeQgNgMABgSQgBgRANgNQANgNARAAQASAAAMANQANANABARQgBASgNAMQgMANgSABQgRgBgNgNg");
	this.shape_54.setTransform(-1.3,-136.6);

	this.shape_55 = new cjs.Shape();
	this.shape_55.graphics.f("#F6A93D").s().p("AgdAeQgNgMgBgSQABgRANgNQAMgNARAAQARAAAOANQANANgBARQABASgNAMQgOANgRABQgRgBgMgNg");
	this.shape_55.setTransform(-12.8,-136.6);

	this.shape_56 = new cjs.Shape();
	this.shape_56.graphics.f("#F6A93D").s().p("Ag0A1QgVgXgBgeQABgdAVgXQAXgWAdABQAfgBAVAWQAXAXAAAdQAAAegXAXQgVAWgfgBQgdABgXgWg");
	this.shape_56.setTransform(81.9,-148.6);

	this.shape_57 = new cjs.Shape();
	this.shape_57.graphics.f("#FFFFFF").s().p("AgNANQgFgFAAgIQAAgHAFgGQAGgFAHAAQAHAAAGAFQAHAGAAAHQAAAIgHAFQgGAGgHAAQgHAAgGgGg");
	this.shape_57.setTransform(133.6,-142.9);

	this.shape_58 = new cjs.Shape();
	this.shape_58.graphics.f("#FFFFFF").s().p("AgNANQgFgFgBgIQABgHAFgGQAGgFAHAAQAHAAAGAFQAHAGAAAHQAAAIgHAFQgGAGgHAAQgHAAgGgGg");
	this.shape_58.setTransform(126.3,-150.2);

	this.shape_59 = new cjs.Shape();
	this.shape_59.graphics.f("#FFFFFF").s().p("AgNANQgFgFAAgIQAAgHAFgGQAGgFAHAAQAIAAAGAFQAFAGAAAHQAAAIgFAFQgGAGgIAAQgHAAgGgGg");
	this.shape_59.setTransform(140.5,-149.8);

	this.shape_60 = new cjs.Shape();
	this.shape_60.graphics.f("#FFFFFF").s().p("AgNANQgFgFAAgIQAAgHAFgGQAGgFAHAAQAIAAAFAFQAHAGgBAHQABAIgHAFQgFAGgIAAQgHAAgGgGg");
	this.shape_60.setTransform(133.2,-157.1);

	this.shape_61 = new cjs.Shape();
	this.shape_61.graphics.f("#FFFFFF").s().p("AgbAcQgMgMAAgQQAAgPAMgMQAMgLAPgBQAQABAMALQAMAMgBAPQABAQgMAMQgMALgQAAQgPAAgMgLg");
	this.shape_61.setTransform(133.6,-149.9);

	this.shape_62 = new cjs.Shape();
	this.shape_62.graphics.f("#67493E").s().p("Ahdh1IAdgSICeD8IgdATg");
	this.shape_62.setTransform(68.2,-151.4);

	this.shape_63 = new cjs.Shape();
	this.shape_63.graphics.f("#67493E").s().p("AgTBHQgJgCgEgHIglg7QgFgGACgIQACgJAHgFIBCgrQAIgEAJACQAIACAFAHIAlA7QAFAGgCAJQgCAIgIAFIhBArQgGADgFAAIgGgBg");
	this.shape_63.setTransform(58.4,-167.4);

	this.shape_64 = new cjs.Shape();
	this.shape_64.graphics.f("#67493E").s().p("Ahdh0IAdgTICeD8IgdATg");
	this.shape_64.setTransform(98.9,-139.2);

	this.shape_65 = new cjs.Shape();
	this.shape_65.graphics.f("#67493E").s().p("AgTBHQgIgCgFgHIglg7QgFgGACgIQACgJAIgFIBBgrQAIgEAJACQAJACAEAHIAlA7QAFAGgCAJQgCAIgIAFIhBArQgFADgGAAIgGgBg");
	this.shape_65.setTransform(108.7,-123.2);

	this.shape_66 = new cjs.Shape();
	this.shape_66.graphics.f("#67493E").s().p("Ag0A1QgWgWAAgfQAAgeAWgWQAWgWAeAAQAfAAAWAWQAWAWAAAeQAAAfgWAWQgWAWgfAAQgeAAgWgWgAgggfQgNANAAASQAAATANAOQAOANASAAQATAAANgNQAOgOAAgTQAAgSgOgNQgNgOgTAAQgSAAgOAOg");
	this.shape_66.setTransform(95.2,-180);

	this.shape_67 = new cjs.Shape();
	this.shape_67.graphics.f("#67493E").s().p("Ag3BDIA5iZIA2AUIg5CZg");
	this.shape_67.setTransform(89.9,-165.9);

	this.shape_68 = new cjs.Shape();
	this.shape_68.graphics.f("#F7D635").s().p("AhhBiQgpgogBg6QABg5ApgpQAogoA5AAQA6AAApAoQApApgBA5QABA6gpAoQgpApg6ABQg5gBgogpg");
	this.shape_68.setTransform(94.8,-179.9);

	this.shape_69 = new cjs.Shape();
	this.shape_69.graphics.f("#67493E").s().p("AhdBeQgognAAg3QAAg2AognQAngoA2AAQA3AAAnAoQAoAnAAA2QAAA3goAnQgnAog3AAQg2AAgngog");
	this.shape_69.setTransform(81.8,-148.7);

	this.shape_70 = new cjs.Shape();
	this.shape_70.graphics.f("#67493E").s().p("AAECXQg9gCgtguQgugtgBg9QgCg+ArgrQArgrA+ACQA9ABAtAuQAuAtABA9QACA+grArQgpAqg8AAIgEAAg");
	this.shape_70.setTransform(133.3,-149.4);

	this.shape_71 = new cjs.Shape();
	this.shape_71.graphics.f("#67493E").s().p("AiaCWIEHlPIAuAkIkIFPg");
	this.shape_71.setTransform(63.1,-123.2);

	this.shape_72 = new cjs.Shape();
	this.shape_72.graphics.f("#F6A93D").s().p("Ah9B+Qg0g0AAhKQAAhJA0g0QA1g0BIAAQBKAAA0A0QA0A0AABJQAABKg0A0Qg0A0hKAAQhIAAg1g0g");
	this.shape_72.setTransform(81.8,-148.7);

	this.shape_73 = new cjs.Shape();
	this.shape_73.graphics.f("#F6A93D").s().p("AiSCTQg+g9AAhWQAAhVA+g+QA9g8BVgBQBWABA+A8QA8A+ABBVQgBBWg8A9Qg+A9hWABQhVgBg9g9g");
	this.shape_73.setTransform(133.3,-149.4);

	this.shape_74 = new cjs.Shape();
	this.shape_74.graphics.f("#F6A93D").s().p("AgQAQQgGgGAAgKQAAgJAGgHQAIgGAIAAQAKAAAGAGQAIAHgBAJQABAKgIAGQgGAIgKAAQgIAAgIgIg");
	this.shape_74.setTransform(-1.8,-201.5);

	this.shape_75 = new cjs.Shape();
	this.shape_75.graphics.f("#FFFFFF").s().p("AgQARQgIgHAAgKQAAgJAIgIQAHgHAJAAQAKAAAIAIQAHAHAAAJQAAAKgIAIQgHAHgKAAQgJAAgHgIg");
	this.shape_75.setTransform(50.8,-134.5);

	this.shape_76 = new cjs.Shape();
	this.shape_76.graphics.f("#FFFFFF").s().p("AgQARQgIgIAAgJQABgJAHgIQAHgHAJAAQAKAAAIAIQAHAIAAAIQAAAKgIAHQgHAIgKAAQgJgBgHgHg");
	this.shape_76.setTransform(31.8,-134.7);

	this.shape_77 = new cjs.Shape();
	this.shape_77.graphics.f("#FFFFFF").s().p("AgQARQgIgHAAgKQAAgJAIgHQAHgIAJAAQAKAAAIAIQAHAHAAAJQAAAKgIAIQgHAHgKAAQgJAAgHgIg");
	this.shape_77.setTransform(41.4,-144);

	this.shape_78 = new cjs.Shape();
	this.shape_78.graphics.f("#FFFFFF").s().p("AgRARQgHgHAAgKQAAgJAIgIQAHgHAJAAQAKAAAIAIQAHAHAAAJQgBAKgHAIQgIAHgJAAQgJAAgIgIg");
	this.shape_78.setTransform(41.2,-125.2);

	this.shape_79 = new cjs.Shape();
	this.shape_79.graphics.f("#FFFFFF").s().p("AgRARQgHgIAAgJQAAgKAIgHQAHgHAJAAQAKAAAIAIQAHAHAAAJQAAAKgIAHQgHAIgKAAQgJgBgIgHg");
	this.shape_79.setTransform(48.1,-141.2);

	this.shape_80 = new cjs.Shape();
	this.shape_80.graphics.f("#FFFFFF").s().p("AgRARQgHgHAAgKQAAgJAIgIQAHgHAJAAQAKAAAIAIQAHAHAAAJQAAAKgIAIQgHAHgKAAQgJAAgIgIg");
	this.shape_80.setTransform(34.5,-128);

	this.shape_81 = new cjs.Shape();
	this.shape_81.graphics.f("#FFFFFF").s().p("AgRARQgHgIAAgJQAAgKAIgHQAHgHAJAAQAKAAAHAIQAIAHAAAJQgBAKgHAHQgIAIgJAAQgKgBgHgHg");
	this.shape_81.setTransform(34.8,-141.4);

	this.shape_82 = new cjs.Shape();
	this.shape_82.graphics.f("#FFFFFF").s().p("AgRARQgHgHAAgKQAAgJAIgIQAHgHAJAAQAKAAAHAIQAIAHAAAJQgBAKgHAIQgIAHgJAAQgKAAgHgIg");
	this.shape_82.setTransform(47.9,-127.9);

	this.shape_83 = new cjs.Shape();
	this.shape_83.graphics.f("#FFFFFF").s().p("AAAA8QgYAAgSgSQgSgSABgYQAAgYASgSQASgRAXAAQAaAAARASQARASABAXQgBAagSARQgSARgYAAIAAAAg");
	this.shape_83.setTransform(41.3,-134.7);

	this.shape_84 = new cjs.Shape();
	this.shape_84.graphics.f("#FFFFFF").s().p("AgSATQgIgIAAgLQAAgKAIgIQAIgIAKAAQALAAAHAIQAJAIAAAKQAAAKgIAJQgIAIgLAAQgKAAgIgIg");
	this.shape_84.setTransform(132.2,37.4);

	this.shape_85 = new cjs.Shape();
	this.shape_85.graphics.f("#FFFFFF").s().p("AgSATQgIgIAAgLQAAgJAIgJQAIgIAKAAQAKAAAJAIQAHAIABAKQAAAKgIAJQgIAIgLAAQgJAAgJgIg");
	this.shape_85.setTransform(146.8,51.9);

	this.shape_86 = new cjs.Shape();
	this.shape_86.graphics.f("#FFFFFF").s().p("AgSATQgIgIAAgLQAAgJAIgJQAIgIAKAAQALAAAIAIQAIAIAAAKQAAALgIAIQgIAHgLABQgKAAgIgIg");
	this.shape_86.setTransform(132.3,51.9);

	this.shape_87 = new cjs.Shape();
	this.shape_87.graphics.f("#FFFFFF").s().p("AgSATQgIgIAAgLQAAgKAIgIQAJgIAJAAQALAAAIAIQAIAIAAAKQAAALgIAHQgIAJgLAAQgJAAgJgIg");
	this.shape_87.setTransform(146.6,37.4);

	this.shape_88 = new cjs.Shape();
	this.shape_88.graphics.f("#FFFFFF").s().p("AgSATQgIgIAAgLQAAgJAIgJQAJgIAJAAQALAAAIAIQAIAJAAAJQAAALgIAIQgIAIgLAAQgJAAgJgIg");
	this.shape_88.setTransform(129.2,44.7);

	this.shape_89 = new cjs.Shape();
	this.shape_89.graphics.f("#FFFFFF").s().p("AgSATQgIgIAAgLQAAgJAIgJQAJgIAJAAQALAAAIAIQAIAJAAAJQAAALgIAIQgIAIgLAAQgJAAgJgIg");
	this.shape_89.setTransform(149.8,44.7);

	this.shape_90 = new cjs.Shape();
	this.shape_90.graphics.f("#FFFFFF").s().p("AgSATQgIgIAAgLQAAgKAIgIQAIgIAKAAQALAAAIAIQAIAIAAAKQAAALgIAIQgIAIgLAAQgKAAgIgIg");
	this.shape_90.setTransform(139.4,54.8);

	this.shape_91 = new cjs.Shape();
	this.shape_91.graphics.f("#FFFFFF").s().p("AgSATQgIgIAAgLQAAgJAIgJQAJgIAJAAQALAAAIAIQAIAIAAAKQAAALgIAIQgIAIgLAAQgJAAgJgIg");
	this.shape_91.setTransform(139.4,34.5);

	this.shape_92 = new cjs.Shape();
	this.shape_92.graphics.f("#FFFFFF").s().p("AgtAuQgTgTAAgbQAAgaATgTQATgTAagBQAbABATATQATATAAAaQAAAbgTATQgTAUgbgBQgaABgTgUgAgigiQgPAOAAAUQAAAUAPAQQAOAOAUAAQAUAAAPgOQAPgQAAgUQAAgUgPgOQgPgPgUgBQgUABgOAPg");
	this.shape_92.setTransform(139.4,44.7);

	this.shape_93 = new cjs.Shape();
	this.shape_93.graphics.f("#67493E").s().p("AiQCJQg8g5AAhQQAAhPA8g5QA8g4BUAAQBUAAA9A4QA8A5AABPQAABQg8A5Qg9A4hUAAQhUAAg8g4g");
	this.shape_93.setTransform(139.9,45.5);

	this.shape_94 = new cjs.Shape();
	this.shape_94.graphics.f("#FFFFFF").s().p("AgWAXQgKgKAAgNQAAgMAKgKQAJgKANAAQANAAAKAKQAKAKAAAMQAAANgKAKQgKAKgNAAQgMAAgKgKg");
	this.shape_94.setTransform(118.9,-104);

	this.shape_95 = new cjs.Shape();
	this.shape_95.graphics.f("#FFFFFF").s().p("AgWAXQgKgKAAgNQAAgMAKgKQAJgKANAAQANAAAKAKQAKAKAAAMQAAANgKAKQgJAKgOAAQgMAAgKgKg");
	this.shape_95.setTransform(136.6,-86.4);

	this.shape_96 = new cjs.Shape();
	this.shape_96.graphics.f("#FFFFFF").s().p("AgWAXQgKgKAAgNQAAgMAKgKQAKgKAMAAQANAAAKAKQAKAKAAAMQAAANgKAKQgJAKgOAAQgMAAgKgKg");
	this.shape_96.setTransform(119,-86.5);

	this.shape_97 = new cjs.Shape();
	this.shape_97.graphics.f("#FFFFFF").s().p("AgWAXQgKgJAAgOQAAgMAKgKQAJgJANgBQANAAAKAKQAKAKAAAMQAAAOgKAJQgJAKgOAAQgMAAgKgKg");
	this.shape_97.setTransform(136.4,-104);

	this.shape_98 = new cjs.Shape();
	this.shape_98.graphics.f("#FFFFFF").s().p("AgWAXQgKgKAAgNQAAgMAKgKQAKgKAMAAQANAAAKAKQAKAKAAAMQAAANgKAKQgKAKgNAAQgMAAgKgKg");
	this.shape_98.setTransform(115.2,-95.2);

	this.shape_99 = new cjs.Shape();
	this.shape_99.graphics.f("#FFFFFF").s().p("AgWAXQgKgKAAgNQAAgMAKgKQAKgKAMAAQANAAAKAKQAKAKAAAMQAAANgKAKQgKAKgNAAQgMAAgKgKg");
	this.shape_99.setTransform(140.2,-95.2);

	this.shape_100 = new cjs.Shape();
	this.shape_100.graphics.f("#FFFFFF").s().p("AgWAXQgKgKAAgNQAAgMAKgKQAKgKAMAAQANAAAKAKQAKAKAAAMQAAANgKAKQgKAKgNAAQgMAAgKgKg");
	this.shape_100.setTransform(127.7,-82.9);

	this.shape_101 = new cjs.Shape();
	this.shape_101.graphics.f("#FFFFFF").s().p("AgWAXQgKgKAAgNQAAgMAKgKQAKgKAMAAQANAAAKAKQAKAKAAAMQAAANgKAKQgKAKgNAAQgMAAgKgKg");
	this.shape_101.setTransform(127.7,-107.6);

	this.shape_102 = new cjs.Shape();
	this.shape_102.graphics.f("#FFFFFF").s().p("Ag3A4QgYgXABghQgBggAYgXQAXgYAgAAQAgAAAYAYQAXAXABAgQgBAhgXAXQgYAYgggBQggABgXgYgAgqgqQgSASAAAYQAAAaASARQARATAZgBQAZABASgTQASgRAAgaQAAgYgSgSQgSgSgZAAQgZAAgRASg");
	this.shape_102.setTransform(127.7,-95.2);

	this.shape_103 = new cjs.Shape();
	this.shape_103.graphics.f("#67493E").s().p("AivCmQhJhFAAhhQAAhgBJhFQBJhFBmAAQBnAABJBFQBJBFAABgQAABhhJBFQhJBFhnAAQhmAAhJhFg");
	this.shape_103.setTransform(128.2,-94.2);

	this.shape_104 = new cjs.Shape();
	this.shape_104.graphics.f("#FFFFFF").s().p("AhEBEQgdgcAAgoQAAgnAdgcQAcgdAoAAQAoAAAdAdQAdAcAAAnQAAAogdAcQgdAdgoAAQgoAAgcgdg");
	this.shape_104.setTransform(-13,-168.6);

	this.shape_105 = new cjs.Shape();
	this.shape_105.graphics.f("#FFFFFF").s().p("AhEBEQgdgcAAgoQAAgnAdgcQAcgdAoAAQAoAAAdAdQAdAcAAAnQAAAogdAcQgdAdgoAAQgoAAgcgdg");
	this.shape_105.setTransform(9.7,-168.6);

	this.shape_106 = new cjs.Shape();
	this.shape_106.graphics.f("#67493E").s().p("Ai9COQgqAAgdgeQgegdAAgqIAAhRQAAgqAegdQAdgeAqAAIF7AAQAqAAAdAeQAeAdAAAqIAABRQAAAqgeAdQgdAegqAAg");
	this.shape_106.setTransform(-1.8,-167.2);

	this.shape_107 = new cjs.Shape();
	this.shape_107.graphics.f("#67493E").s().p("AgPBbIABi1IAeAAIgBC1g");
	this.shape_107.setTransform(147.2,-108.8);

	this.shape_108 = new cjs.Shape();
	this.shape_108.graphics.f("#67493E").s().p("AgCA7QgZgBgQgUQgRgSACgWQACgZATgQQASgQAWABQAZACAQASQAQATgBAWQgCAZgSAQQgRAPgWAAIgCAAg");
	this.shape_108.setTransform(146.8,-122.6);

	this.shape_109 = new cjs.Shape();
	this.shape_109.graphics.f("#67493E").s().p("AAABMQgfgBgWgXQgWgWABgeQAAgfAXgWQAWgWAeABQAfAAAWAWQAWAXgBAdQAAAggXAWQgWAWgeAAIAAAAgAgfggQgOANAAATQAAASANAOQANAOATAAQASAAAOgNQAOgOAAgTQAAgRgNgOQgOgOgTAAIAAAAQgSAAgNANg");
	this.shape_109.setTransform(104.9,-80.9);

	this.shape_110 = new cjs.Shape();
	this.shape_110.graphics.f("#67493E").s().p("AAABLQgfAAgVgWQgXgXAAgeQABgfAXgWQAVgWAeAAQAgABAWAWQAVAXABAdQgBAggXAWQgVAWgfAAIAAgBgAgfggQgOAOAAASQgBASAOAOQAOAOASAAQASAAAOgNQAOgOAAgTQAAgRgNgOQgOgOgTAAQgRAAgOANg");
	this.shape_110.setTransform(123.5,-16.7);

	this.shape_111 = new cjs.Shape();
	this.shape_111.graphics.f("#67493E").s().p("AhLgxIAdgcIB6CAIgdAbg");
	this.shape_111.setTransform(113.6,-26.8);

	this.shape_112 = new cjs.Shape();
	this.shape_112.graphics.f("#67493E").s().p("AgwHLIAAuVIBhAAIAAOVg");
	this.shape_112.setTransform(-2.3,3);

	this.shape_113 = new cjs.Shape();
	this.shape_113.graphics.f("#67493E").s().p("AhRBLIAAiVICjAAIAACVg");
	this.shape_113.setTransform(-1.8,-69.4);

	this.shape_114 = new cjs.Shape();
	this.shape_114.graphics.f("#67493E").s().p("AgQBIIAAiPIAhAAIAACPg");
	this.shape_114.setTransform(-1.9,-190.5);

	this.shape_115 = new cjs.Shape();
	this.shape_115.graphics.f("#67493E").s().p("AgiAjQgPgOAAgVQAAgTAPgPQAOgPAUAAQAUAAAQAPQAOAPAAATQAAAVgOAOQgQAPgUAAQgUAAgOgPg");
	this.shape_115.setTransform(-1.9,-201.5);

	this.shape_116 = new cjs.Shape();
	this.shape_116.graphics.f("#67493E").s().p("AhvA1QgMAAgJgJQgIgJAAgMIAAgtQAAgMAIgJQAJgJAMAAIDeAAQANAAAIAJQAJAJAAAMIAAAtQAAAMgJAJQgIAJgNAAg");
	this.shape_116.setTransform(-2.1,-179.2);

	this.shape_117 = new cjs.Shape();
	this.shape_117.graphics.f("#67493E").s().p("AgoApQgRgRAAgYQAAgXARgRQARgRAXAAQAYAAARARQARARAAAXQAAAYgRARQgRARgYAAQgXAAgRgRg");
	this.shape_117.setTransform(16.3,60.5);

	this.shape_118 = new cjs.Shape();
	this.shape_118.graphics.f("#67493E").s().p("AgoApQgRgRAAgYQAAgXARgRQARgRAXAAQAYAAARARQARARAAAXQAAAYgRARQgRARgYAAQgXAAgRgRg");
	this.shape_118.setTransform(18.3,44.9);

	this.shape_119 = new cjs.Shape();
	this.shape_119.graphics.f("#67493E").s().p("AhjBkQgqgqAAg6QAAg5AqgqQAqgqA5AAQA7AAApAqQAqAqAAA5QAAA6gqAqQgpAqg7AAQg6AAgpgqg");
	this.shape_119.setTransform(47.2,18.4);

	this.shape_120 = new cjs.Shape();
	this.shape_120.graphics.f("#67493E").s().p("AhCBDQgcgcAAgnQAAgmAcgcQAcgcAmAAQAnAAAcAcQAcAcAAAmQAAAngcAcQgcAcgnAAQgmAAgcgcg");
	this.shape_120.setTransform(102.5,-16.8);

	this.shape_121 = new cjs.Shape();
	this.shape_121.graphics.f("#67493E").s().p("AhCBDQgcgcAAgnQAAgmAcgcQAcgcAmAAQAnAAAcAcQAcAcAAAmQAAAngcAcQgcAcgnAAQgmAAgcgcg");
	this.shape_121.setTransform(102.5,35);

	this.shape_122 = new cjs.Shape();
	this.shape_122.graphics.f("#67493E").s().p("AhWBXQgkgkAAgzQAAgyAkgkQAkgkAyAAQAzAAAkAkQAkAkAAAyQAAAzgkAkQgkAkgzAAQgyAAgkgkg");
	this.shape_122.setTransform(-1.9,49.7);

	this.shape_123 = new cjs.Shape();
	this.shape_123.graphics.f("#67493E").s().p("AAABuQguAAgggiQggghABgrQABguAgggQAhggAsABQAuABAgAgQAgAhgBAsQAAAugiAgQggAfgsAAIAAAAg");
	this.shape_123.setTransform(143.5,6.5);

	this.shape_124 = new cjs.Shape();
	this.shape_124.graphics.f("#67493E").s().p("AhXCRQgLAAgIgHQgIgHAAgKIAAjyQAAgKAIgHQAIgHALAAICvAAQALAAAIAHQAIAIAAAKIAADyQAAAKgIAHQgIAHgMAAg");
	this.shape_124.setTransform(43.5,-98.4);

	this.shape_125 = new cjs.Shape();
	this.shape_125.graphics.f("#67493E").s().p("AiDF9QghAAgXgXQgYgYAAghIAApZQAAghAYgYQAXgXAhAAIEHAAQAhAAAXAXQAYAYAAAhIAAJZQAAAhgYAYQgXAXghAAg");
	this.shape_125.setTransform(-2.1,-111.5);

	this.shape_126 = new cjs.Shape();
	this.shape_126.graphics.f("#67493E").s().p("AlCkOIA0g0IJSJRIg1A0g");
	this.shape_126.setTransform(102.5,5.1);

	this.shape_127 = new cjs.Shape();
	this.shape_127.graphics.f("#67493E").s().p("Aldj0IBphoIJSJRIhpBpg");
	this.shape_127.setTransform(37.5,-59.8);

	this.shape_128 = new cjs.Shape();
	this.shape_128.graphics.f("#67493E").s().p("AjFCKIFPlQIA8A9IlPFPg");
	this.shape_128.setTransform(160.7,-111.4);

	this.shape_129 = new cjs.Shape();
	this.shape_129.graphics.f("#67493E").s().p("AjKCPIFZlZIA8A8IlZFZg");
	this.shape_129.setTransform(161.2,-173.6);

	this.shape_130 = new cjs.Shape();
	this.shape_130.graphics.f("#67493E").s().p("AqmAnIU1jfIAYCTI01Deg");
	this.shape_130.setTransform(65.9,-141.7);

	this.shape_131 = new cjs.Shape();
	this.shape_131.graphics.f("#67493E").s().p("Ap2AxIAAhhITtAAIAABhg");
	this.shape_131.setTransform(70.1,-99.2);

	this.shape_132 = new cjs.Shape();
	this.shape_132.graphics.f("#E95632").s().p("AgBDFQhSgBg5g7Qg6g7AChPQABhSA7g6QA6g5BQACQBSABA5A6QA5A7gBBQQgBBSg7A5Qg6A4hPAAIgBAAg");
	this.shape_132.setTransform(69.8,-28.9);

	this.shape_133 = new cjs.Shape();
	this.shape_133.graphics.f("#E95632").s().p("AgBDFQhSgBg6g7Qg5g7AChPQABhSA6g6QA7g5BQACQBSABA5A7QA5A6gBBQQgBBSg7A5Qg6A4hPAAIgBAAg");
	this.shape_133.setTransform(78.2,-99.6);

	this.shape_134 = new cjs.Shape();
	this.shape_134.graphics.f("#E95632").s().p("Ag+A/QgbgaAAglQAAgkAbgaQAagbAkAAQAlAAAbAbQAaAaAAAkQAAAlgaAaQgbAbglAAQgkAAgagbg");
	this.shape_134.setTransform(-2.1,-220.5);

	this.shape_135 = new cjs.Shape();
	this.shape_135.graphics.f("#E95632").s().p("AkGEHQhuhtAAiaQAAiZBuhtQBthuCZAAQCaAABuBuQBtBtAACZQAACahtBtQhuBuiaAAQiZAAhthug");
	this.shape_135.setTransform(-2.1,-172.1);

	this.shape_136 = new cjs.Shape();
	this.shape_136.graphics.f("#67493E").s().p("AgYGoIAMtQIAlABIgMNQg");
	this.shape_136.setTransform(43.8,-65);

	this.shape_137 = new cjs.Shape();
	this.shape_137.graphics.f("#67493E").s().p("AAAAyQgVgBgOgPQgOgPAAgTQABgUAPgPQAPgOATAAQAUABAPAPQAOAPAAATQgBAVgPAOQgPAOgTAAIAAAAg");
	this.shape_137.setTransform(42.3,-23.9);

	this.shape_138 = new cjs.Shape();
	this.shape_138.graphics.f("#67493E").s().p("AgThmIAmgBIABDOIgmAAg");
	this.shape_138.setTransform(129.3,-67.1);

	this.shape_139 = new cjs.Shape();
	this.shape_139.graphics.f("#67493E").s().p("AhOAVICKhLIATAiIiKBLg");
	this.shape_139.setTransform(111.5,26.1);

	this.shape_140 = new cjs.Shape();
	this.shape_140.graphics.f("#67493E").s().p("AhOAVICKhLIATAjIiKBKg");
	this.shape_140.setTransform(95.3,-13);

	this.shape_141 = new cjs.Shape();
	this.shape_141.graphics.f("#67493E").s().p("AivBJIFMi0IATAiIlMC1g");
	this.shape_141.setTransform(19.6,31.3);

	this.shape_142 = new cjs.Shape();
	this.shape_142.graphics.f("#67493E").s().p("AivBKIFMi1IATAiIlMC1g");
	this.shape_142.setTransform(25.8,-15.5);

	this.shape_143 = new cjs.Shape();
	this.shape_143.graphics.f("#F79D3C").s().p("AiCCUIDilAIAjAZIjiFAg");
	this.shape_143.setTransform(124.4,-123.2);

	this.shape_144 = new cjs.Shape();
	this.shape_144.graphics.f("#F79D3C").s().p("AiijQIAkgXIEgG3IgkAYg");
	this.shape_144.setTransform(22.4,9.6);

	this.shape_145 = new cjs.Shape();
	this.shape_145.graphics.f("#F6A93D").s().p("AhKBLQgggfAAgsQAAgrAggfQAfggArAAQAsAAAfAgQAgAfAAArQAAAsggAfQgfAggsAAQgrAAgfggg");
	this.shape_145.setTransform(104.4,-80.3);

	this.shape_146 = new cjs.Shape();
	this.shape_146.graphics.f("#F79D3C").s().p("Ag3A4QgYgXAAghQAAggAYgXQAXgYAgAAQAhAAAYAYQAXAXAAAgQAAAhgXAXQgYAYghAAQggAAgXgYg");
	this.shape_146.setTransform(18.3,-27.6);

	this.shape_147 = new cjs.Shape();
	this.shape_147.graphics.f("#F7D635").s().p("Ah+B/Qg0g1AAhKQAAhJA0g1QA1g0BJgBQBKABA1A0QA1A1AABJQAABKg1A1Qg1A1hKgBQhJABg1g1g");
	this.shape_147.setTransform(-2.5,-220.5);

	this.shape_148 = new cjs.Shape();
	this.shape_148.graphics.f("#F7D635").s().p("AgpAqQgRgRAAgZQAAgXARgSQARgRAYAAQAYAAASARQARASAAAXQAAAZgRARQgSARgYAAQgYAAgRgRg");
	this.shape_148.setTransform(-54.9,-184.5);

	this.shape_149 = new cjs.Shape();
	this.shape_149.graphics.f("#F7D635").s().p("AgpApQgRgRAAgYQAAgXARgSQARgRAYAAQAYAAASARQARASAAAXQAAAYgRARQgSASgYAAQgYAAgRgSg");
	this.shape_149.setTransform(49.8,-187.2);

	this.shape_150 = new cjs.Shape();
	this.shape_150.graphics.f("#F7D635").s().p("AgpAqQgRgRAAgZQAAgXARgSQASgRAXAAQAZAAARARQARASAAAXQAAAZgRARQgRARgZAAQgXAAgSgRg");
	this.shape_150.setTransform(-2,-247.1);

	this.shape_151 = new cjs.Shape();
	this.shape_151.graphics.f("#F7D635").s().p("AgFDKQhUgDg5g9Qg5g9AChSQADhUA9g5QA9g5BSACQBUADA5A9QA5A9gCBSQgDBTg9A6Qg6A3hQAAIgFAAg");
	this.shape_151.setTransform(117.6,-22.7);

	this.shape_152 = new cjs.Shape();
	this.shape_152.graphics.f("#67493E").s().p("AhJgyIAbgaIB4B/IgbAag");
	this.shape_152.setTransform(132.4,-6);

	this.shape_153 = new cjs.Shape();
	this.shape_153.graphics.f("#F6A93D").s().p("AgBDPQhXAAg8g/Qg8g9AChUQABhXA+g8QA9g8BVABQBWABA8A+QA8A/gBBTQgBBXg+A8Qg9A7hTAAIgCgBg");
	this.shape_153.setTransform(47.2,18.4);

	this.shape_154 = new cjs.Shape();
	this.shape_154.graphics.f("#67493E").s().p("AgBCoQhGgBgxgyQgwgyABhEQABhGAygxQAygwBEABQBGABAxAyQAwAygBBEQgBBFgyAxQgxAwhEAAIgBAAg");
	this.shape_154.setTransform(41.2,-135.2);

	this.shape_155 = new cjs.Shape();
	this.shape_155.graphics.f("#85C4AC").s().p("AgCDeQhcgChAhCQhAhCABhaQABhcBChAQBChABbABQBcABBABDQBABCgBBaQgBBchCBAQhBA/hZAAIgDAAg");
	this.shape_155.setTransform(178.7,-128.7);

	this.shape_156 = new cjs.Shape();
	this.shape_156.graphics.f("#E95632").s().p("AgCD4QhogBhHhKQhIhKABhlQAChoBKhHQBKhIBlABQBnACBIBKQBIBKgBBlQgCBnhKBJQhJBGhkAAIgCgBg");
	this.shape_156.setTransform(178.7,-190.8);

	this.shape_157 = new cjs.Shape();
	this.shape_157.graphics.f("#85C4AC").s().p("AgDFKQiJgChfhiQhghjADiHQACiIBihfQBihfCGABQCJACBfBiQBgBjgCCGQgDCJhiBfQhgBeiFAAIgDAAg");
	this.shape_157.setTransform(56.5,-45.2);

	this.shape_158 = new cjs.Shape();
	this.shape_158.graphics.f("#F79D3C").s().p("AiyDbIFFnNIAgAYIlFHNg");
	this.shape_158.setTransform(182.6,-162);

	this.shape_159 = new cjs.Shape();
	this.shape_159.graphics.f("#F79D3C").s().p("AiUCnIEJllIAgAYIkJFlg");
	this.shape_159.setTransform(180.6,-100.6);

	this.shape_160 = new cjs.Shape();
	this.shape_160.graphics.f("#F7D635").s().p("AhVBWQgkgkAAgyQAAgxAkgkQAkgkAxAAQAyAAAkAkQAkAkAAAxQAAAygkAkQgkAkgyAAQgxAAgkgkg");
	this.shape_160.setTransform(-35.1,-178.2);

	this.shape_161 = new cjs.Shape();
	this.shape_161.graphics.f("#F7D635").s().p("AhTBUQgkgiAAgyQAAgwAkgkQAjgjAwAAQAxAAAkAjQAjAkAAAwQAAAygjAiQgkAkgxAAQgwAAgjgkg");
	this.shape_161.setTransform(31.4,-178.2);

	this.shape_162 = new cjs.Shape();
	this.shape_162.graphics.f("#F7D635").s().p("AiVCWQg/g+AAhYQAAhXA/g+QA+g/BXAAQBYAAA+A/QA/A+AABXQAABYg/A+Qg+A/hYAAQhXAAg+g/g");
	this.shape_162.setTransform(162.5,-62.7);

	this.shape_163 = new cjs.Shape();
	this.shape_163.graphics.f("#F6A93D").s().p("AhyB0QgxgxABhDQgBhCAxgxQAvgwBDABQBDgBAxAwQAvAxAABCQAABDgvAxQgxAvhDAAQhDAAgvgvg");
	this.shape_163.setTransform(143.5,6.5);

	this.shape_164 = new cjs.Shape();
	this.shape_164.graphics.f("#F79D3C").s().p("Ag3ChIBFlKIAqAJIhFFKg");
	this.shape_164.setTransform(152.8,-47.8);

	this.shape_165 = new cjs.Shape();
	this.shape_165.graphics.f("#F79D3C").s().p("AguijIArgHIAyFNIgqAHg");
	this.shape_165.setTransform(151,-17.6);

	this.shape_166 = new cjs.Shape();
	this.shape_166.graphics.f("#F79D3C").s().p("AiqAFIFNg0IAHArIlMA0g");
	this.shape_166.setTransform(106.3,-161.4);

	this.shape_167 = new cjs.Shape();
	this.shape_167.graphics.f("#E95632").s().p("AiyCzQhKhKAAhpQAAhoBKhKQBKhKBoAAQBoAABLBKQBKBKAABoQAABphKBKQhLBKhoAAQhoAAhKhKg");
	this.shape_167.setTransform(139.9,44.8);

	this.shape_168 = new cjs.Shape();
	this.shape_168.graphics.f("#F7D635").s().p("AgdAiQgPgMgBgUQgBgRAMgOQANgPATgBQASgCAOANQAPANABAUQACARgNAOQgNAPgTABIgDAAQgQAAgNgMg");
	this.shape_168.setTransform(-182.9,-190.8);

	this.shape_169 = new cjs.Shape();
	this.shape_169.graphics.f("#67493E").s().p("AgxA5QgXgVgCgfQgCgeAUgXQAVgYAggCQAdgCAYAVQAXAUACAgQACAdgUAYQgVAXggACIgEAAQgbAAgWgSg");
	this.shape_169.setTransform(-182.9,-190.9);

	this.shape_170 = new cjs.Shape();
	this.shape_170.graphics.f("#FFFFFF").s().p("AgzA2QgWgWgCgfQAAgeAWgWQAWgXAfAAQAegBAXAWQAWAWAAAfQABAegWAWQgWAXgfAAIgBAAQgdAAgWgVg");
	this.shape_170.setTransform(-147.6,6.4);

	this.shape_171 = new cjs.Shape();
	this.shape_171.graphics.f("#F79D3C").s().p("AgfAhQgOgOgBgTQABgSAOgNQANgOASAAQATAAAOAOQANANAAASQAAATgNAOQgOANgTAAQgSAAgNgNg");
	this.shape_171.setTransform(-170.7,-82.2);

	this.shape_172 = new cjs.Shape();
	this.shape_172.graphics.f("#F79D3C").s().p("AgwAxQgUgUAAgdQAAgbAUgVQAVgUAbAAQAdAAAUAUQAVAVgBAbQABAdgVAUQgUAVgdgBQgbABgVgVg");
	this.shape_172.setTransform(-152.5,-29);

	this.shape_173 = new cjs.Shape();
	this.shape_173.graphics.f("#67493E").s().p("Ag+A/QgbgaAAglQAAgkAbgaQAagaAkgBQAlABAaAaQAbAaAAAkQAAAlgbAaQgaAbglgBQgkABgagbg");
	this.shape_173.setTransform(-182.9,-190.8);

	this.shape_174 = new cjs.Shape();
	this.shape_174.graphics.f("#FFFFFF").s().p("AhoBpQgsgrAAg+QAAg8AsgsQAsgsA8AAQA+AAArAsQAsAsAAA8QAAA+gsArQgrAsg+AAQg8AAgsgsg");
	this.shape_174.setTransform(-182.9,-190.8);

	this.shape_175 = new cjs.Shape();
	this.shape_175.graphics.f("#67493E").s().p("Ag+A/QgbgaAAglQAAgjAbgbQAagaAkgBQAlABAaAaQAbAbAAAjQAAAlgbAaQgaAaglAAQgkAAgagag");
	this.shape_175.setTransform(-182.9,-128.7);

	this.shape_176 = new cjs.Shape();
	this.shape_176.graphics.f("#FFFFFF").s().p("AhRBSQgigiAAgwQAAgvAigiQAigiAvAAQAwAAAiAiQAiAiAAAvQAAAwgiAiQgiAigwAAQgvAAgigig");
	this.shape_176.setTransform(-182.9,-128.7);

	this.shape_177 = new cjs.Shape();
	this.shape_177.graphics.f("#FFFFFF").s().p("AgcAdQgNgMAAgRQAAgQANgMQAMgNAQAAQARAAAMANQANAMAAAQQAAARgNAMQgMANgRAAQgQAAgMgNg");
	this.shape_177.setTransform(-77,-0.9);

	this.shape_178 = new cjs.Shape();
	this.shape_178.graphics.f("#67493E").s().p("Ag3A4QgYgXAAghQAAggAYgXQAXgYAgAAQAhAAAXAYQAYAXAAAgQAAAhgYAXQgXAYghAAQggAAgXgYg");
	this.shape_178.setTransform(-77,-0.9);

	this.shape_179 = new cjs.Shape();
	this.shape_179.graphics.f("#67493E").s().p("AgUBuIAAjbIApAAIAADbg");
	this.shape_179.setTransform(-63.6,-47.9);

	this.shape_180 = new cjs.Shape();
	this.shape_180.graphics.f("#67493E").s().p("AgREHIAAoOIAjAAIAAIOg");
	this.shape_180.setTransform(-91.4,19);

	this.shape_181 = new cjs.Shape();
	this.shape_181.graphics.f("#67493E").s().p("AgREHIAAoNIAjAAIAAINg");
	this.shape_181.setTransform(-77.1,5.8);

	this.shape_182 = new cjs.Shape();
	this.shape_182.graphics.f("#FFFFFF").s().p("AgcAdQgNgMAAgRQAAgQANgMQAMgNAQAAQARAAAMANQANAMAAAQQAAARgNAMQgMANgRAAQgQAAgMgNg");
	this.shape_182.setTransform(-90.2,52.4);

	this.shape_183 = new cjs.Shape();
	this.shape_183.graphics.f("#67493E").s().p("Ag3A4QgYgXAAghQAAggAYgXQAXgYAgAAQAhAAAXAYQAYAXAAAgQAAAhgYAXQgXAYghAAQggAAgXgYg");
	this.shape_183.setTransform(-90.2,52.4);

	this.shape_184 = new cjs.Shape();
	this.shape_184.graphics.f("#E95632").s().p("AgpAqQgRgSAAgYQAAgXARgSQASgRAXAAQAYAAASARQARASAAAXQAAAYgRASQgSARgYAAQgXAAgSgRg");
	this.shape_184.setTransform(-82.2,-99.7);

	this.shape_185 = new cjs.Shape();
	this.shape_185.graphics.f("#67493E").s().p("AhPBPQggghgBguQABgtAgghQAighAtAAQAuAAAiAhQAgAhABAtQgBAuggAhQgiAhguAAQgtAAgighg");
	this.shape_185.setTransform(-82.2,-99.7);

	this.shape_186 = new cjs.Shape();
	this.shape_186.graphics.f("#E95632").s().p("AgpAqQgRgSAAgYQAAgXARgSQASgRAXAAQAZAAAQARQASASAAAXQAAAYgSASQgRARgYAAQgXAAgSgRg");
	this.shape_186.setTransform(-73.9,-28.9);

	this.shape_187 = new cjs.Shape();
	this.shape_187.graphics.f("#67493E").s().p("AhOBPQgighAAguQAAgtAighQAgghAuAAQAuAAAiAhQAgAhAAAtQAAAuggAhQgiAhguAAQguAAggghg");
	this.shape_187.setTransform(-73.9,-29);

	this.shape_188 = new cjs.Shape();
	this.shape_188.graphics.f("#FFFFFF").s().p("AguAuQgTgTAAgbQAAgaATgTQAUgUAaAAQAbAAATAUQAUATAAAaQAAAbgUATQgTAUgbAAQgaAAgUgUg");
	this.shape_188.setTransform(-132.9,-46.9);

	this.shape_189 = new cjs.Shape();
	this.shape_189.graphics.f("#67493E").s().p("AhYBZQgkglgBg0QABgyAkglQAlglAzAAQAzAAAlAlQAmAlgBAyQABA0gmAlQglAkgzAAQgzAAglgkg");
	this.shape_189.setTransform(-132.9,-47);

	this.shape_190 = new cjs.Shape();
	this.shape_190.graphics.f("#FFFFFF").s().p("AgiAjQgPgPAAgUQAAgTAPgPQAPgPATAAQAUAAAPAPQAPAPAAATQAAAUgPAPQgPAPgUAAQgTAAgPgPg");
	this.shape_190.setTransform(-64.4,-65.4);

	this.shape_191 = new cjs.Shape();
	this.shape_191.graphics.f("#67493E").s().p("AhCBDQgcgcAAgnQAAgmAcgcQAcgcAmAAQAnAAAcAcQAcAcAAAmQAAAngcAcQgcAcgnAAQgmAAgcgcg");
	this.shape_191.setTransform(-64.4,-65.4);

	this.shape_192 = new cjs.Shape();
	this.shape_192.graphics.f("#FFFFFF").s().p("AgcAeQgNgNAAgRQAAgQANgMQAMgNAQAAQARAAAMANQANAMAAAQQAAARgNANQgMAMgRAAQgQAAgMgMg");
	this.shape_192.setTransform(-77,39.2);

	this.shape_193 = new cjs.Shape();
	this.shape_193.graphics.f("#67493E").s().p("Ag3A5QgYgYAAghQAAggAYgXQAXgYAgAAQAhAAAXAYQAYAXAAAgQAAAhgYAYQgXAXghAAQggAAgXgXg");
	this.shape_193.setTransform(-77,39.2);

	this.shape_194 = new cjs.Shape();
	this.shape_194.graphics.f("#80C4A7").s().p("AgPAQQgHgHAAgJQAAgIAHgHQAHgHAIAAQAJAAAHAHQAHAHAAAIQAAAJgHAHQgHAHgJAAQgIAAgHgHg");
	this.shape_194.setTransform(-46.4,-23.9);

	this.shape_195 = new cjs.Shape();
	this.shape_195.graphics.f("#80C4A7").s().p("AgUAVQgJgIAAgNQAAgLAJgJQAJgJALAAQAMAAAJAJQAJAJAAALQAAAMgJAJQgIAJgNAAIAAAAQgLAAgJgJg");
	this.shape_195.setTransform(-108.2,-42.1);

	this.shape_196 = new cjs.Shape();
	this.shape_196.graphics.f("#80C4A7").s().p("AghAjQgOgOgBgVQAAgSAOgPQAPgOATgBQATAAAPAOQAOAOABAUQAAATgOAPQgOAOgVABIAAAAQgTAAgOgOg");
	this.shape_196.setTransform(-95.3,-41.6);

	this.shape_197 = new cjs.Shape();
	this.shape_197.graphics.f("#FFFFFF").s().p("AgdAfQgNgNAAgSQAAgQAMgNQANgNARAAQARgBANANQANANAAARQABARgNANQgNANgSAAIAAAAQgQAAgNgMg");
	this.shape_197.setTransform(-101.3,-60.1);

	this.shape_198 = new cjs.Shape();
	this.shape_198.graphics.f("#67493E").s().p("AgwAzQgVgVgBgdQAAgcAVgVQAUgVAdgBQAcAAAVAUQAVAVABAdQAAAcgUAVQgVAVgdABIgBAAQgbAAgVgUg");
	this.shape_198.setTransform(-101.3,-60.1);

	this.shape_199 = new cjs.Shape();
	this.shape_199.graphics.f("#67493E").s().p("Ah/B+QgWgWAAgfIgCiMQgBgfAWgXQAWgWAfAAICXgDQAfAAAWAWQAXAVAAAfIACCMQABAfgWAXQgWAWgfAAIiXADIgCAAQgeAAgWgVg");
	this.shape_199.setTransform(-100.6,-45.1);

	this.shape_200 = new cjs.Shape();
	this.shape_200.graphics.f("#F6A93D").s().p("Ag0A0QgVgVAAgfQAAgeAVgWQAWgVAeAAQAfAAAVAVQAWAWAAAeQAAAfgWAVQgVAWgfAAQgeAAgWgWg");
	this.shape_200.setTransform(-85.9,-148.7);

	this.shape_201 = new cjs.Shape();
	this.shape_201.graphics.f("#FFFFFF").s().p("AgNAOQgFgGAAgIQAAgHAFgFQAGgHAHAAQAIAAAGAHQAFAFAAAHQAAAIgFAGQgGAFgIABQgHgBgGgFg");
	this.shape_201.setTransform(-137.7,-142.9);

	this.shape_202 = new cjs.Shape();
	this.shape_202.graphics.f("#FFFFFF").s().p("AgNAOQgFgGAAgIQAAgHAFgFQAGgHAHAAQAIAAAGAHQAFAFAAAHQAAAIgFAGQgGAFgIAAQgHAAgGgFg");
	this.shape_202.setTransform(-130.4,-150.2);

	this.shape_203 = new cjs.Shape();
	this.shape_203.graphics.f("#FFFFFF").s().p("AgNAOQgFgGAAgIQAAgHAFgFQAGgHAHABQAIgBAFAHQAGAFAAAHQAAAIgGAGQgFAFgIAAQgHAAgGgFg");
	this.shape_203.setTransform(-144.6,-149.9);

	this.shape_204 = new cjs.Shape();
	this.shape_204.graphics.f("#FFFFFF").s().p("AgNAOQgFgGAAgIQAAgHAFgGQAGgFAHAAQAIAAAGAFQAFAGAAAHQAAAIgFAGQgGAFgIAAQgHAAgGgFg");
	this.shape_204.setTransform(-137.3,-157.2);

	this.shape_205 = new cjs.Shape();
	this.shape_205.graphics.f("#FFFFFF").s().p("AgbAbQgLgLAAgQQAAgPALgMQAMgMAPABQAQgBAMAMQALAMAAAPQAAAQgLALQgMAMgQAAQgPAAgMgMg");
	this.shape_205.setTransform(-137.7,-150);

	this.shape_206 = new cjs.Shape();
	this.shape_206.graphics.f("#67493E").s().p("AhdB2ICej9IAeATIifD8g");
	this.shape_206.setTransform(-72.2,-151.4);

	this.shape_207 = new cjs.Shape();
	this.shape_207.graphics.f("#67493E").s().p("AADBFIhCgrQgHgFgCgIQgCgJAEgGIAlg7QAFgHAJgDQAJgBAIAEIBBArQAIAFACAJQACAIgFAGIglA7QgFAHgIACIgFABQgGAAgGgDg");
	this.shape_207.setTransform(-62.4,-167.4);

	this.shape_208 = new cjs.Shape();
	this.shape_208.graphics.f("#67493E").s().p("AhdB1ICej8IAdASIieD9g");
	this.shape_208.setTransform(-103,-139.3);

	this.shape_209 = new cjs.Shape();
	this.shape_209.graphics.f("#67493E").s().p("AAEBEIhDgqQgHgFgCgJQgCgJAFgFIAlg6QAEgJAJgBQAJgCAHAEIBDArQAHAFACAIQACAKgFAFIglA7QgEAIgJACIgFAAQgGAAgFgEg");
	this.shape_209.setTransform(-112.8,-123.3);

	this.shape_210 = new cjs.Shape();
	this.shape_210.graphics.f("#67493E").s().p("Ag0A1QgWgWAAgfQAAgeAWgWQAWgWAeAAQAfAAAWAWQAWAWAAAeQAAAfgWAWQgWAWgfAAQgeAAgWgWgAgfggQgOAOAAASQAAATAOANQANAOASAAQATAAAOgOQANgNAAgTQAAgSgNgOQgOgNgTAAQgSAAgNANg");
	this.shape_210.setTransform(-99.3,-180);

	this.shape_211 = new cjs.Shape();
	this.shape_211.graphics.f("#67493E").s().p("Ag3hCIA2gUIA5CZIg3AUg");
	this.shape_211.setTransform(-93.9,-165.9);

	this.shape_212 = new cjs.Shape();
	this.shape_212.graphics.f("#F7D635").s().p("AhiBiQgpgpAAg5QAAg4ApgqQAqgpA4AAQA5AAApApQAqAqAAA4QAAA5gqApQgpAqg5AAQg4AAgqgqg");
	this.shape_212.setTransform(-98.8,-180);

	this.shape_213 = new cjs.Shape();
	this.shape_213.graphics.f("#67493E").s().p("AhdBeQgognAAg3QAAg2AognQAngoA2AAQA3AAAnAoQAoAnAAA2QAAA3goAnQgnAog3AAQg2AAgngog");
	this.shape_213.setTransform(-85.9,-148.7);

	this.shape_214 = new cjs.Shape();
	this.shape_214.graphics.f("#67493E").s().p("AhsBtQgrgrACg+QACg9AtgtQAuguA8gBQA/gCAqArQArArgBA+QgCA9guAtQgtAug9ABIgFAAQg7AAgpgpg");
	this.shape_214.setTransform(-137.4,-149.5);

	this.shape_215 = new cjs.Shape();
	this.shape_215.graphics.f("#67493E").s().p("AibiVIAugkIEIFPIgtAkg");
	this.shape_215.setTransform(-67.1,-123.2);

	this.shape_216 = new cjs.Shape();
	this.shape_216.graphics.f("#F6A93D").s().p("Ah9B+Qg0g1AAhJQAAhJA0g0QA0g0BJAAQBKAAA0A0QA0A0AABJQAABJg0A1Qg0A0hKAAQhJAAg0g0g");
	this.shape_216.setTransform(-85.9,-148.7);

	this.shape_217 = new cjs.Shape();
	this.shape_217.graphics.f("#F6A93D").s().p("AiSCTQg+g8AAhXQAAhVA+g9QA8g+BWAAQBWAAA+A+QA8A9AABVQAABXg8A8Qg+A+hWAAQhWAAg8g+g");
	this.shape_217.setTransform(-137.4,-149.5);

	this.shape_218 = new cjs.Shape();
	this.shape_218.graphics.f("#FFFFFF").s().p("AgQARQgIgHAAgKQAAgJAHgHQAIgIAJAAQAJAAAIAHQAHAIABAJQAAAJgHAIQgIAHgKABQgIAAgIgIg");
	this.shape_218.setTransform(-54.8,-134.6);

	this.shape_219 = new cjs.Shape();
	this.shape_219.graphics.f("#FFFFFF").s().p("AgQASQgHgIgBgKQAAgJAIgHQAGgIAKAAQAJAAAIAIQAIAHAAAJQAAAKgHAHQgHAIgLAAIAAAAQgJAAgHgHg");
	this.shape_219.setTransform(-35.8,-134.8);

	this.shape_220 = new cjs.Shape();
	this.shape_220.graphics.f("#FFFFFF").s().p("AgQASQgIgIAAgKQAAgJAHgHQAIgIAJAAQAKAAAHAHQAIAIAAAJQAAAKgHAHQgIAHgKABQgJAAgHgHg");
	this.shape_220.setTransform(-45.5,-144.1);

	this.shape_221 = new cjs.Shape();
	this.shape_221.graphics.f("#FFFFFF").s().p("AgQASQgIgIAAgKQAAgIAIgIQAHgHAJgBQAKAAAHAIQAIAHAAAJQAAAKgHAHQgIAIgKAAIAAAAQgJAAgHgHg");
	this.shape_221.setTransform(-45.3,-125.3);

	this.shape_222 = new cjs.Shape();
	this.shape_222.graphics.f("#FFFFFF").s().p("AgQASQgIgIAAgKQAAgJAHgHQAHgIAKAAQAJAAAIAHQAHAIABAJQAAAKgIAHQgHAIgKAAQgJAAgHgHg");
	this.shape_222.setTransform(-52.1,-141.3);

	this.shape_223 = new cjs.Shape();
	this.shape_223.graphics.f("#FFFFFF").s().p("AgQARQgIgHAAgKQAAgJAHgHQAIgIAJAAQAKAAAHAHQAIAHAAAKQAAAJgHAIQgIAHgKABQgJAAgHgIg");
	this.shape_223.setTransform(-38.5,-128.1);

	this.shape_224 = new cjs.Shape();
	this.shape_224.graphics.f("#FFFFFF").s().p("AgQARQgIgHAAgKQAAgJAHgHQAIgIAJAAQAKAAAHAHQAIAHAAAKQAAAJgHAIQgIAHgKABQgJAAgHgIg");
	this.shape_224.setTransform(-38.8,-141.4);

	this.shape_225 = new cjs.Shape();
	this.shape_225.graphics.f("#FFFFFF").s().p("AgQASQgIgIAAgKQAAgJAHgHQAIgIAJAAQAKAAAHAHQAIAIAAAJQAAAKgHAHQgIAIgKAAQgJAAgHgHg");
	this.shape_225.setTransform(-51.9,-128);

	this.shape_226 = new cjs.Shape();
	this.shape_226.graphics.f("#FFFFFF").s().p("AgpArQgSgRgBgaQAAgXASgSQARgSAZAAQAXgBATASQASARABAZQAAAYgSASQgSASgZAAQgXAAgSgRg");
	this.shape_226.setTransform(-45.3,-134.7);

	this.shape_227 = new cjs.Shape();
	this.shape_227.graphics.f("#FFFFFF").s().p("AgSATQgIgJAAgKQAAgKAIgIQAIgIAKAAQALAAAHAIQAJAIAAAKQAAAKgJAJQgHAIgLAAQgKAAgIgIg");
	this.shape_227.setTransform(-136.2,37.4);

	this.shape_228 = new cjs.Shape();
	this.shape_228.graphics.f("#FFFFFF").s().p("AgSATQgIgIAAgLQAAgKAIgIQAIgIAKAAQALAAAIAIQAIAJAAAJQAAALgIAIQgIAIgLAAQgKgBgIgHg");
	this.shape_228.setTransform(-150.9,51.9);

	this.shape_229 = new cjs.Shape();
	this.shape_229.graphics.f("#FFFFFF").s().p("AgSASQgIgHAAgLQAAgKAIgIQAIgIAKAAQAKAAAIAIQAJAIAAAKQAAALgJAHQgIAJgKAAQgKAAgIgJg");
	this.shape_229.setTransform(-136.3,51.8);

	this.shape_230 = new cjs.Shape();
	this.shape_230.graphics.f("#FFFFFF").s().p("AgSATQgIgJAAgKQAAgKAIgIQAJgIAJAAQALAAAIAIQAIAIAAAKQAAAKgIAJQgIAIgLAAQgKAAgIgIg");
	this.shape_230.setTransform(-150.7,37.4);

	this.shape_231 = new cjs.Shape();
	this.shape_231.graphics.f("#FFFFFF").s().p("AgSATQgIgIAAgLQAAgKAIgIQAIgIAKAAQALAAAIAIQAIAIAAAKQAAALgIAIQgIAIgLAAQgJAAgJgIg");
	this.shape_231.setTransform(-133.3,44.6);

	this.shape_232 = new cjs.Shape();
	this.shape_232.graphics.f("#FFFFFF").s().p("AgSATQgIgIAAgLQAAgKAIgIQAIgIAKAAQALAAAIAIQAIAIAAAKQAAALgIAIQgIAIgLAAQgJAAgJgIg");
	this.shape_232.setTransform(-153.9,44.6);

	this.shape_233 = new cjs.Shape();
	this.shape_233.graphics.f("#FFFFFF").s().p("AgSATQgIgIAAgLQAAgKAIgIQAJgIAJAAQALAAAIAIQAIAIAAAKQAAALgIAIQgIAIgLAAQgJAAgJgIg");
	this.shape_233.setTransform(-143.5,54.8);

	this.shape_234 = new cjs.Shape();
	this.shape_234.graphics.f("#FFFFFF").s().p("AgSATQgIgIAAgLQAAgKAIgIQAIgIAKAAQALAAAIAIQAIAIAAAKQAAALgIAIQgIAIgLAAQgJAAgJgIg");
	this.shape_234.setTransform(-143.5,34.4);

	this.shape_235 = new cjs.Shape();
	this.shape_235.graphics.f("#FFFFFF").s().p("AgtAuQgTgTAAgbQAAgaATgTQATgTAaAAQAbAAATATQATATAAAaQAAAbgTATQgTATgbAAQgaAAgTgTgAgigiQgPAPgBATQABAVAPAPQAOAOAUAAQAUAAAQgOQAPgPAAgVQAAgTgPgPQgQgPgUAAQgUAAgOAPg");
	this.shape_235.setTransform(-143.5,44.6);

	this.shape_236 = new cjs.Shape();
	this.shape_236.graphics.f("#67493E").s().p("AiQCIQg8g4AAhQQAAhPA8g5QA9g4BTAAQBVAAA8A4QA8A5AABPQAABQg8A4Qg8A5hVAAQhTAAg9g5g");
	this.shape_236.setTransform(-144,45.4);

	this.shape_237 = new cjs.Shape();
	this.shape_237.graphics.f("#FFFFFF").s().p("AgXAXQgJgKAAgNQAAgMAKgKQAKgKAMAAQANAAAKAKQAKAKAAAMQAAAOgKAJQgKAKgNAAQgMAAgLgKg");
	this.shape_237.setTransform(-122.9,-104.1);

	this.shape_238 = new cjs.Shape();
	this.shape_238.graphics.f("#FFFFFF").s().p("AgWAXQgKgKAAgNQAAgNAKgJQAKgKAMAAQAOAAAJAKQAKAKAAAMQAAANgKAKQgJAKgOAAQgMAAgKgKg");
	this.shape_238.setTransform(-140.7,-86.5);

	this.shape_239 = new cjs.Shape();
	this.shape_239.graphics.f("#FFFFFF").s().p("AgWAXQgKgKAAgNQAAgMAKgLQAJgJANAAQANAAAKAKQAKAKAAAMQAAANgKAKQgKAKgNAAQgMAAgKgKg");
	this.shape_239.setTransform(-123.1,-86.5);

	this.shape_240 = new cjs.Shape();
	this.shape_240.graphics.f("#FFFFFF").s().p("AAAAhQgNAAgJgKQgKgKAAgNQAAgMAKgKQAKgKAMAAQANAAAKAKQAKAKAAAMQAAAOgKAJQgKAKgMAAIgBAAg");
	this.shape_240.setTransform(-140.5,-104.1);

	this.shape_241 = new cjs.Shape();
	this.shape_241.graphics.f("#FFFFFF").s().p("AgWAXQgKgKAAgNQAAgNAKgJQAJgKANAAQANAAAKAKQAKAJAAANQAAANgKAKQgKAKgNAAQgNAAgJgKg");
	this.shape_241.setTransform(-119.3,-95.3);

	this.shape_242 = new cjs.Shape();
	this.shape_242.graphics.f("#FFFFFF").s().p("AgWAXQgKgKAAgNQAAgNAKgJQAKgKAMAAQANAAAKAKQAKAJAAANQAAANgKAKQgKAKgNAAQgMAAgKgKg");
	this.shape_242.setTransform(-144.4,-95.3);

	this.shape_243 = new cjs.Shape();
	this.shape_243.graphics.f("#FFFFFF").s().p("AgWAXQgKgKAAgNQAAgNAKgJQAJgKANAAQANAAAKAKQAKAJAAANQAAANgKAKQgKAKgNAAQgNAAgJgKg");
	this.shape_243.setTransform(-131.8,-82.9);

	this.shape_244 = new cjs.Shape();
	this.shape_244.graphics.f("#FFFFFF").s().p("AgWAXQgKgKAAgNQAAgMAKgKQAJgKANAAQANAAAKAKQAKAKAAAMQAAANgKAKQgKAKgNAAQgNAAgJgKg");
	this.shape_244.setTransform(-131.8,-107.7);

	this.shape_245 = new cjs.Shape();
	this.shape_245.graphics.f("#FFFFFF").s().p("Ag3A4QgXgYAAggQAAggAXgXQAXgYAgABQAggBAYAYQAXAXAAAgQAAAggXAYQgYAXggABQgggBgXgXgAgqgqQgSASAAAYQAAAZASATQASASAYAAQAZAAASgSQASgTAAgZQAAgYgSgSQgSgSgZAAQgYAAgSASg");
	this.shape_245.setTransform(-131.8,-95.3);

	this.shape_246 = new cjs.Shape();
	this.shape_246.graphics.f("#67493E").s().p("AivCmQhJhFAAhhQAAhgBJhFQBJhFBmAAQBnAABJBFQBJBFAABgQAABhhJBFQhJBFhnAAQhmAAhJhFg");
	this.shape_246.setTransform(-132.3,-94.3);

	this.shape_247 = new cjs.Shape();
	this.shape_247.graphics.f("#67493E").s().p("AgOBcIgBi3IAfAAIAAC3g");
	this.shape_247.setTransform(-151.3,-108.9);

	this.shape_248 = new cjs.Shape();
	this.shape_248.graphics.f("#67493E").s().p("AgmAsQgTgQgBgZQgCgWARgTQAQgSAYgCQAXgCATARQATAQABAYQACAXgQATQgRATgZABIgDAAQgVAAgRgPg");
	this.shape_248.setTransform(-150.9,-122.6);

	this.shape_249 = new cjs.Shape();
	this.shape_249.graphics.f("#67493E").s().p("AgzA2QgXgWgBgfQAAgeAWgWQAWgXAfAAQAegBAXAWQAWAWAAAfQABAegWAWQgWAXgfAAIgBAAQgdAAgWgVgAAAgtQgSAAgOAOQgNAOAAARQAAAUAOANQAOANARAAQAUAAANgOQANgOAAgSQAAgSgOgOQgNgNgTAAIAAAAg");
	this.shape_249.setTransform(-109,-81);

	this.shape_250 = new cjs.Shape();
	this.shape_250.graphics.f("#67493E").s().p("Ag0A2QgWgXgBgfQAAgeAWgVQAWgXAfgBQAeAAAXAXQAWAVABAfQAAAegWAWQgWAXggAAQgdAAgXgVgAAAgtQgSAAgOAOQgNAOAAARQAAATAOANQAOAOARAAQATAAAOgOQANgOAAgSQAAgSgOgOQgNgNgSAAIgBAAg");
	this.shape_250.setTransform(-127.6,-16.7);

	this.shape_251 = new cjs.Shape();
	this.shape_251.graphics.f("#67493E").s().p("AhLAzIB6iAIAdAcIh6B/g");
	this.shape_251.setTransform(-117.7,-26.9);

	this.shape_252 = new cjs.Shape();
	this.shape_252.graphics.f("#67493E").s().p("AgoApQgRgRAAgYQAAgXARgRQARgRAXAAQAYAAARARQARARAAAXQAAAYgRARQgRARgYAAQgXAAgRgRg");
	this.shape_252.setTransform(-20.4,60.4);

	this.shape_253 = new cjs.Shape();
	this.shape_253.graphics.f("#67493E").s().p("AgoApQgRgRAAgYQAAgXARgRQARgRAXAAQAYAAARARQARARAAAXQAAAYgRARQgRARgYAAQgXAAgRgRg");
	this.shape_253.setTransform(-22.4,44.9);

	this.shape_254 = new cjs.Shape();
	this.shape_254.graphics.f("#67493E").s().p("AhjBkQgqgqAAg6QAAg6AqgqQAqgpA5AAQA7AAApApQAqAqAAA6QAAA6gqAqQgqAqg6AAQg5AAgqgqg");
	this.shape_254.setTransform(-51.3,18.4);

	this.shape_255 = new cjs.Shape();
	this.shape_255.graphics.f("#67493E").s().p("AhCBDQgcgcAAgnQAAgmAcgcQAcgcAmAAQAnAAAcAcQAcAcAAAmQAAAngcAcQgcAcgnAAQgmAAgcgcg");
	this.shape_255.setTransform(-106.6,-16.8);

	this.shape_256 = new cjs.Shape();
	this.shape_256.graphics.f("#67493E").s().p("AhCBDQgcgcAAgnQAAgmAcgcQAcgcAmAAQAnAAAcAcQAcAcAAAmQAAAngcAcQgcAcgnAAQgmAAgcgcg");
	this.shape_256.setTransform(-106.6,35);

	this.shape_257 = new cjs.Shape();
	this.shape_257.graphics.f("#67493E").s().p("AhMBPQghggAAguQgBgsAgghQAgggAugBQAsgBAhAgQAgAgABAuQABAsggAhQggAgguABIgBAAQgrAAghgfg");
	this.shape_257.setTransform(-147.6,6.4);

	this.shape_258 = new cjs.Shape();
	this.shape_258.graphics.f("#67493E").s().p("AhXCSQgLAAgIgHQgIgHAAgKIAAjyQAAgKAIgHQAIgHALAAICugBQAMAAAIAHQAIAHAAAKIAADyQAAAKgIAIQgIAHgLAAg");
	this.shape_258.setTransform(-47.5,-98.5);

	this.shape_259 = new cjs.Shape();
	this.shape_259.graphics.f("#67493E").s().p("AlDEPIJSpSIA0A1IpSJRg");
	this.shape_259.setTransform(-106.6,5);

	this.shape_260 = new cjs.Shape();
	this.shape_260.graphics.f("#67493E").s().p("AldD1IJSpSIBpBpIpSJRg");
	this.shape_260.setTransform(-41.5,-59.9);

	this.shape_261 = new cjs.Shape();
	this.shape_261.graphics.f("#67493E").s().p("AjFiJIA8g8IFQFPIg9A8g");
	this.shape_261.setTransform(-164.9,-111.5);

	this.shape_262 = new cjs.Shape();
	this.shape_262.graphics.f("#67493E").s().p("AjLiOIA9g8IFaFZIg9A8g");
	this.shape_262.setTransform(-165.4,-173.6);

	this.shape_263 = new cjs.Shape();
	this.shape_263.graphics.f("#67493E").s().p("AqngmIAZiSIU2DeIgZCTg");
	this.shape_263.setTransform(-69.9,-141.7);

	this.shape_264 = new cjs.Shape();
	this.shape_264.graphics.f("#67493E").s().p("Ap2AxIAAhhITtAAIAABhg");
	this.shape_264.setTransform(-74.2,-99.2);

	this.shape_265 = new cjs.Shape();
	this.shape_265.graphics.f("#E95632").s().p("AiJCNQg6g5gBhSQgBhPA4g7QA5g7BSgBQBRgBA6A5QA7A5ACBSQABBQg5A6Qg6A7hSABIgCAAQhPAAg6g4g");
	this.shape_265.setTransform(-73.9,-29);

	this.shape_266 = new cjs.Shape();
	this.shape_266.graphics.f("#E95632").s().p("AiICOQg8g6AAhSQgBhQA4g6QA5g7BTgBQBQgCA6A5QA8A5AABTQABBPg4A7Qg5A7hTABIgCAAQhPAAg5g3g");
	this.shape_266.setTransform(-82.2,-99.7);

	this.shape_267 = new cjs.Shape();
	this.shape_267.graphics.f("#67493E").s().p("AgYmnIAlgBIANNQIgmABg");
	this.shape_267.setTransform(-47.9,-65.1);

	this.shape_268 = new cjs.Shape();
	this.shape_268.graphics.f("#67493E").s().p("AghAkQgPgPgBgUQAAgTAOgPQAOgPAVgBQATAAAPAOQAPAOABAVQAAATgOAPQgOAPgVABIgBAAQgTAAgOgOg");
	this.shape_268.setTransform(-46.4,-23.9);

	this.shape_269 = new cjs.Shape();
	this.shape_269.graphics.f("#67493E").s().p("AgTBnIABjNIAmAAIgBDNg");
	this.shape_269.setTransform(-133.4,-67.2);

	this.shape_270 = new cjs.Shape();
	this.shape_270.graphics.f("#67493E").s().p("AhNgTIATgjICIBKIgTAjg");
	this.shape_270.setTransform(-115.6,26);

	this.shape_271 = new cjs.Shape();
	this.shape_271.graphics.f("#67493E").s().p("AhOgUIATgiICKBKIgTAjg");
	this.shape_271.setTransform(-99.4,-13);

	this.shape_272 = new cjs.Shape();
	this.shape_272.graphics.f("#67493E").s().p("AivhJIATgiIFMC1IgTAjg");
	this.shape_272.setTransform(-23.6,31.2);

	this.shape_273 = new cjs.Shape();
	this.shape_273.graphics.f("#67493E").s().p("AivhJIATgiIFMC1IgUAig");
	this.shape_273.setTransform(-29.8,-15.5);

	this.shape_274 = new cjs.Shape();
	this.shape_274.graphics.f("#F79D3C").s().p("AiCiTIAjgZIDiFAIgjAZg");
	this.shape_274.setTransform(-128.5,-123.3);

	this.shape_275 = new cjs.Shape();
	this.shape_275.graphics.f("#F79D3C").s().p("AiiDRIEgm4IAlAYIkhG3g");
	this.shape_275.setTransform(-26.4,9.5);

	this.shape_276 = new cjs.Shape();
	this.shape_276.graphics.f("#F6A93D").s().p("AhKBLQgggfAAgsQAAgrAggfQAfggArAAQAsAAAgAgQAfAfAAArQAAAsgfAfQggAggsAAQgrAAgfggg");
	this.shape_276.setTransform(-108.5,-80.3);

	this.shape_277 = new cjs.Shape();
	this.shape_277.graphics.f("#F79D3C").s().p("Ag4A5QgXgYAAghQAAggAXgYQAYgXAgAAQAhAAAYAXQAXAYAAAgQAAAhgXAYQgYAXghAAQggAAgYgXg");
	this.shape_277.setTransform(-22.3,-27.6);

	this.shape_278 = new cjs.Shape();
	this.shape_278.graphics.f("#F7D635").s().p("AiJCTQg+g5gChUQgChSA5g9QA6g+BTgCQBSgCA9A5QA+A5ACBUQACBSg5A9Qg5A9hUADIgGAAQhPAAg6g3g");
	this.shape_278.setTransform(-121.6,-22.7);

	this.shape_279 = new cjs.Shape();
	this.shape_279.graphics.f("#67493E").s().p("AhJAzIB4h/IAbAaIh4B/g");
	this.shape_279.setTransform(-136.5,-6.1);

	this.shape_280 = new cjs.Shape();
	this.shape_280.graphics.f("#F6A93D").s().p("AiPCVQg/g8AAhWQgChUA8g+QA8g+BXgBQBTgCA/A8QA+A8ABBXQABBUg8A+Qg8A+hXABIgCAAQhTAAg8g7g");
	this.shape_280.setTransform(-51.3,18.3);

	this.shape_281 = new cjs.Shape();
	this.shape_281.graphics.f("#67493E").s().p("Ah0B5QgygxgBhGQgBhEAwgyQAxgyBGgBQBEgBAyAwQAyAxABBGQABBEgxAyQgwAyhGABIgCAAQhDAAgxgvg");
	this.shape_281.setTransform(-45.3,-135.3);

	this.shape_282 = new cjs.Shape();
	this.shape_282.graphics.f("#85C4AC").s().p("AiaCfQhChAgBhdQgBhZBAhCQBAhDBcgBQBagBBDBAQBCBAABBdQABBZhABCQhABChcACIgDAAQhYAAhCg/g");
	this.shape_282.setTransform(-182.9,-128.7);

	this.shape_283 = new cjs.Shape();
	this.shape_283.graphics.f("#E95632").s().p("AisCyQhKhIgChnQgBhlBIhKQBIhKBngCQBlgBBKBIQBKBIACBnQABBlhIBKQhIBKhnACIgDAAQhjAAhJhHg");
	this.shape_283.setTransform(-182.9,-190.9);

	this.shape_284 = new cjs.Shape();
	this.shape_284.graphics.f("#85C4AC").s().p("AjlDsQhihfgCiJQgCiGBfhjQBghiCIgCQCHgBBiBfQBiBfADCJQACCGhgBiQhfBiiJADIgEAAQiFAAhgheg");
	this.shape_284.setTransform(-60.6,-45.2);

	this.shape_285 = new cjs.Shape();
	this.shape_285.graphics.f("#F79D3C").s().p("AizjbIAhgWIFFHMIggAYg");
	this.shape_285.setTransform(-186.8,-162.1);

	this.shape_286 = new cjs.Shape();
	this.shape_286.graphics.f("#F79D3C").s().p("AiUimIAggYIEJFlIggAYg");
	this.shape_286.setTransform(-184.8,-100.6);

	this.shape_287 = new cjs.Shape();
	this.shape_287.graphics.f("#F7D635").s().p("AiVCWQg/g+AAhYQAAhXA/g+QA+g/BXAAQBYAAA+A/QA/A+AABXQAABYg/A+Qg+A/hYAAQhXAAg+g/g");
	this.shape_287.setTransform(-166.7,-62.7);

	this.shape_288 = new cjs.Shape();
	this.shape_288.graphics.f("#F6A93D").s().p("AhzBzQgwgvABhEQgBhCAwgwQAxgwBCAAQBDAAAxAwQAvAwAABCQAABEgvAvQgxAwhDAAQhCAAgxgwg");
	this.shape_288.setTransform(-147.6,6.4);

	this.shape_289 = new cjs.Shape();
	this.shape_289.graphics.f("#F79D3C").s().p("Ag4ifIArgKIBGFKIgrAJg");
	this.shape_289.setTransform(-156.9,-47.9);

	this.shape_290 = new cjs.Shape();
	this.shape_290.graphics.f("#F79D3C").s().p("AguCkIAylNIArAHIgzFMg");
	this.shape_290.setTransform(-155.2,-17.7);

	this.shape_291 = new cjs.Shape();
	this.shape_291.graphics.f("#F79D3C").s().p("AiqgEIAHgqIFOAzIgHArg");
	this.shape_291.setTransform(-110.4,-161.5);

	this.shape_292 = new cjs.Shape();
	this.shape_292.graphics.f("#E95632").s().p("AiyCzQhKhLAAhoQAAhoBKhKQBKhKBoAAQBpAABKBKQBLBKgBBoQABBohLBLQhKBKhpAAQhoAAhKhKg");
	this.shape_292.setTransform(-144,45.1);

	this.shape_293 = new cjs.Shape();
	this.shape_293.graphics.f("#E95632").s().p("AC0A0QgEgFAAgFIAAg1QAAgFgCgFQgDgFgGAAQgHAAgDAFQgCAFAAAFIAAA1QAAAFgEAFQgEADgGAAQgGAAgEgDQgEgFAAgFIAAg1QAAgFgCgFQgDgFgHAAQgGAAgDAFQgCAFAAAFIAAA1QAAAFgEAFQgEADgGAAQgGAAgEgDQgEgFAAgFIAAhTQAAgFAEgFQAEgDAGAAQAFgBAEAEQAHgEAJABQAIgBAHADQAGACAFAFQAFgFAGgCQAHgDAIABQAKAAAIADQAHAFAFAGQAFAHACAHQACAIAAAHIAAA1QAAAFgEAFQgEADgGAAQgGAAgEgDgAgVAzQgKgEgIgIQgHgIgFgKQgEgKAAgLQAAgKAEgKQAFgKAHgIQAIgIAKgEQALgFAKABQAKgBALAFQAKAEAHAIQAIAIAFAKQAEAKAAAKQAAALgEAKQgFAKgIAIQgHAIgKAEQgLAFgKgBQgKABgLgFgAgKgZQgFADgEAEQgEADgCAGQgCAFAAAEQAAAFACAFQACAGAEADQAEAEAFADQAFABAFAAQAFAAAFgBIAJgHQAEgDACgGQACgFAAgFQAAgEgCgFQgCgGgEgDIgJgHQgFgBgFAAQgFAAgFABgAh8AzQgKgEgHgIQgHgIgEgKQgEgKAAgLQAAgKAEgKQAEgKAHgIQAHgIAKgEQAKgFAKABQAMAAAKAEQAEACACAEQACADAAAEIgCAGQgDAIgJAAQgDAAgDgCQgFgBgFAAQgFAAgEABIgIAHQgDADgCAGQgCAFAAAEQAAAFACAFQACAGADADIAIAHQAEABAFAAQAFAAAFgBQACgCAEAAQAEAAADACQAEADABADIACAGQAAAEgCADQgCAEgEACQgLAEgLAAQgKABgKgFgAjHA0QgEgFAAgFQAAgHAEgDQAEgFAGAAQAGAAAEAFQAEADAAAHQAAAFgEAFQgEADgGAAQgGAAgEgDg");
	this.shape_293.setTransform(188.5,94.1);

	this.shape_294 = new cjs.Shape();
	this.shape_294.graphics.f("#F6A93D").s().p("AtRCqQgGgCgEgFQgDgGAAgHQAAgEACgEIAjhOIg4h2QgCgEAAgFQAAgGADgGQADgFAGgDQAEgBAFAAQAOAAAGAMIAqBWIAqhWQAGgMANAAQAFAAAEABQAGADAEAFQADAGAAAGQAAAFgDAEIg9CAIgDAEIglBRQgCAHgGADQgFADgGAAQgGAAgDgCgAX0BPQgGgGAAgIIAAjWQAAgKAGgGQAGgGAJAAQAJAAAGAGQAHAGAAAKIAADWQAAAIgHAGQgGAHgJAAQgJAAgGgHgAWnBKQgLAGgOADIgYADQgLAAgKgDQgKgDgIgGQgHgFgGgJQgFgIgCgLIgCgLQAAgQAKgNQAIgJANgFQAIgFALgCQAMgDAOAAIAeABQgCgMgFgDQgIgFgLABQgJAAgLADQgJAEgGAFQgGAFgIAAQgKAAgHgIQgFgFAAgJQAAgKAIgGQALgJAOgGQANgFAPgCIAKAAQALgBAKADQAKADAJAEQAdARACArIAABQQAAAIgGAGQgHAHgIAAQgOAAgGgMgAVuAWQgHACgCACIgBAEIAAABQADAMAPgBIAPgBIABAAQAJgDAIgFQAGgEADgGIACgEIggAAQgLAAgJADgAT1BOIhFhRIAABEQAAAIgHAGQgGAHgJAAQgJAAgGgHQgGgGAAgIIAAiAQAAgHADgFQAEgGAHgDIAHAAQAKAAAHAHIBGBRIAAhDQAAgJAGgGQAGgHAJABQAJgBAGAHQAGAGAAAJIAACAQAAAGgDAGQgEAGgGACIgIABQgKAAgHgIgAPvBPQgPgHgMgMQgMgLgHgQQgGgQAAgRQAAgQAGgQQAHgPAMgMQAMgMAPgHQAQgGASAAQARAAAQAGQAQAHAMAMQAMAMAHAPQAGAQAAAQQAAARgGAQQgHAQgMALQgMAMgQAHQgQAHgRAAQgSAAgQgHgAQAgmQgIADgGAGQgGAGgDAIQgDAIAAAHQAAAJADAHQADAIAGAGQAGAGAIAEQAIACAJAAQAJAAAIgCQAHgEAGgGQAGgGAEgIQADgHAAgJQAAgHgDgIQgEgIgGgGQgGgGgHgDQgIgEgJABQgJgBgIAEgAN4BPQgGgGAAgIIAAiAQAAgJAGgGQAHgHAJABQAIgBAHAHQAGAGAAAJIAACAQAAAIgGAGQgHAHgIAAQgJAAgHgHgAMFBPQgHgGAAgIIAAhqIgVAAQgJAAgHgHQgGgGAAgJQAAgJAGgGQAHgHAJABIAVAAIAAhBQAAgKAHgGQAGgGAJAAQAJAAAGAGQAGAGAAAKIAABBIAWAAQAJgBAGAHQAHAGAAAJQAAAJgHAGQgGAHgJAAIgWAAIAABqQAAAIgGAGQgGAHgJAAQgJAAgGgHgAJpBPQgPgHgLgMQgLgLgHgQQgGgQAAgRQAAgQAGgQQAHgPALgMQALgMAPgHQAPgGAQAAQARAAAQAHQAGACADAGQAEAFAAAGQAAAFgDAFQgGAMgNAAQgFAAgEgCQgHgEgIABQgIgBgHAEQgGADgGAGQgFAGgDAIQgDAIAAAHQAAAJADAHQADAIAFAGQAGAGAGAEQAHACAIAAQAIAAAHgCQAEgCAFAAQAGAAAFADQAGADACAFQADAFAAAFQAAAGgEAFQgDAGgGACQgQAIgRAAQgQAAgPgHgAHzBOIhFhRIAABEQAAAIgHAGQgGAHgJAAQgJAAgGgHQgGgGAAgIIAAiAQAAgHADgFQAEgGAHgDIAHAAQAKAAAHAHIBGBRIAAhDQAAgJAGgGQAGgHAJABQAJgBAGAHQAGAGAAAJIAACAQAAAGgDAGQgEAGgGACIgIABQgKAAgHgIgAENBUQgJgDgIgEQgIgEgGgGQgGgHgEgJQgJgPAAgRIAAhSQAAgJAGgGQAHgHAJABQAIgBAHAHQAGAGAAAJIAABSQAAAHAEAGQADAFAEADQAGACAJAAQAOABAIgLQAEgGAAgHIAAhSQAAgJAGgGQAHgHAJABQAIgBAHAHQAGAGAAAJIAABSQAAARgIAPQgFAJgGAHQgGAGgIAEQgHAEgJADQgKACgKAAQgKAAgJgCgABuBPQgHgGAAgIIAAhqIgKAAQgJAAgHgHQgGgGAAgJQAAgJAGgGQAHgHAJABIAKAAIABgiQACgKAFgJQAEgJAGgGQAGgGAHgFQAHgDAJgCQAIgDAKAAQAJAAAGAGQAHAGAAAKQAAAIgHAHQgGAGgJAAQgNAAgFAJQgDAGAAAHIAAAWIAVAAQAJgBAGAHQAHAGAAAJQAAAJgHAGQgGAHgJAAIgVAAIAABqQAAAIgHAGQgGAHgJAAQgJAAgGgHgAhZBTQgFgEgDgFQgKAFgLAEQgMADgMAAQgRAAgQgHQgQgHgMgMQgMgLgGgQQgHgQAAgRQAAgQAHgQQAGgPAMgMQAMgMAQgHQAQgGARAAQAMAAALACQALADAKAGIAAhMQAAgKAGgGQAGgGAJAAQAJAAAGAGQAHAGAAAKIAADWQAAAIgHAGQgGAHgJAAQgGAAgGgDgAiegmQgIADgGAGQgGAGgDAIQgEAIAAAHQAAAJAEAHQADAIAGAGQAGAGAIAEQAIACAIAAQAJAAAIgCQAIgEAGgGQAGgGADgIQAEgHAAgJQAAgHgEgIQgDgIgGgGQgGgGgIgDQgIgEgJABQgIgBgIAEgAkoBOIhFhRIAABEQAAAIgHAGQgGAHgJAAQgJAAgGgHQgGgGAAgIIAAiAQAAgHADgFQAEgGAHgDIAHAAQAKAAAHAHIBGBRIAAhDQAAgJAGgGQAGgHAJABQAJgBAGAHQAGAGAAAJIAACAQAAAGgDAGQgEAGgGACIgIABQgKAAgHgIgAnfBKQgLAGgOADIgYADQgLAAgKgDQgKgDgIgGQgHgFgGgJQgFgIgCgLIgCgLQAAgQAKgNQAIgJANgFQAIgFALgCQAMgDAOAAIAeABQgCgMgFgDQgIgFgLABQgJAAgLADQgJAEgGAFQgGAFgIAAQgKAAgHgIQgFgFAAgJQAAgKAIgGQALgJAOgGQANgFAPgCIAKAAQALgBAKADQAKADAJAEQAdARACArIAABQQAAAIgGAGQgHAHgIAAQgOAAgGgMgAoYAWQgHACgCACIgBAEIAAABQADAMAPgBIAPgBIABAAQAJgDAIgFQAGgEADgGIACgEIggAAQgLAAgJADgAu3BOIhGhRIAABEQAAAIgGAGQgGAHgJAAQgJAAgHgHQgGgGAAgIIAAiAQAAgHAEgFQAEgGAGgDIAIAAQAKAAAGAHIBGBRIAAhDQAAgJAGgGQAHgHAJABQAIgBAHAHQAGAGAAAJIAACAQAAAGgEAGQgEAGgGACIgIABQgKAAgGgIgAxsBOIhFhRIAABEQAAAIgHAGQgGAHgJAAQgJAAgGgHQgGgGAAgIIAAiAQAAgHADgFQAEgGAHgDIAHAAQAKAAAHAHIBGBRIAAhDQAAgJAGgGQAGgHAJABQAJgBAGAHQAGAGAAAJIAACAQAAAGgDAGQgEAGgGACIgIABQgKAAgHgIgA1SBUQgJgDgIgEQgIgEgGgGQgGgHgEgJQgJgPAAgRIAAhSQAAgJAGgGQAHgHAJABQAIgBAHAHQAGAGAAAJIAABSQAAAHAEAGQADAFAEADQAGACAJAAQAOABAIgLQAEgGAAgHIAAhSQAAgJAGgGQAHgHAJABQAIgBAHAHQAGAGAAAJIAABSQAAARgIAPQgFAJgGAHQgGAGgIAEQgHAEgJADQgKACgKAAQgKAAgJgCgA3xBPQgHgGAAgIIAAhqIgKAAQgJAAgHgHQgGgGAAgJQAAgJAGgGQAHgHAJABIAKAAIABgiQACgKAFgJQAEgJAGgGQAGgGAHgFQAHgDAJgCQAIgDAKAAQAJAAAGAGQAHAGAAAKQAAAIgHAHQgGAGgJAAQgNAAgFAJQgDAGAAAHIAAAWIAVAAQAJgBAGAHQAHAGAAAJQAAAJgHAGQgGAHgJAAIgVAAIAABqQAAAIgHAGQgGAHgJAAQgJAAgGgHgAN4h7QgGgGAAgJQAAgJAGgHQAHgGAJAAQAIAAAHAGQAGAHAAAJQAAAJgGAGQgHAHgIgBQgJABgHgHg");
	this.shape_294.setTransform(-2.2,182.2);

	this.addChild(this.shape_294,this.shape_293,this.shape_292,this.shape_291,this.shape_290,this.shape_289,this.shape_288,this.shape_287,this.shape_286,this.shape_285,this.shape_284,this.shape_283,this.shape_282,this.shape_281,this.shape_280,this.shape_279,this.shape_278,this.shape_277,this.shape_276,this.shape_275,this.shape_274,this.shape_273,this.shape_272,this.shape_271,this.shape_270,this.shape_269,this.shape_268,this.shape_267,this.shape_266,this.shape_265,this.shape_264,this.shape_263,this.shape_262,this.shape_261,this.shape_260,this.shape_259,this.shape_258,this.shape_257,this.shape_256,this.shape_255,this.shape_254,this.shape_253,this.shape_252,this.shape_251,this.shape_250,this.shape_249,this.shape_248,this.shape_247,this.shape_246,this.shape_245,this.shape_244,this.shape_243,this.shape_242,this.shape_241,this.shape_240,this.shape_239,this.shape_238,this.shape_237,this.shape_236,this.shape_235,this.shape_234,this.shape_233,this.shape_232,this.shape_231,this.shape_230,this.shape_229,this.shape_228,this.shape_227,this.shape_226,this.shape_225,this.shape_224,this.shape_223,this.shape_222,this.shape_221,this.shape_220,this.shape_219,this.shape_218,this.shape_217,this.shape_216,this.shape_215,this.shape_214,this.shape_213,this.shape_212,this.shape_211,this.shape_210,this.shape_209,this.shape_208,this.shape_207,this.shape_206,this.shape_205,this.shape_204,this.shape_203,this.shape_202,this.shape_201,this.shape_200,this.shape_199,this.shape_198,this.shape_197,this.shape_196,this.shape_195,this.shape_194,this.shape_193,this.shape_192,this.shape_191,this.shape_190,this.shape_189,this.shape_188,this.shape_187,this.shape_186,this.shape_185,this.shape_184,this.shape_183,this.shape_182,this.shape_181,this.shape_180,this.shape_179,this.shape_178,this.shape_177,this.shape_176,this.shape_175,this.shape_174,this.shape_173,this.shape_172,this.shape_171,this.shape_170,this.shape_169,this.shape_168,this.shape_167,this.shape_166,this.shape_165,this.shape_164,this.shape_163,this.shape_162,this.shape_161,this.shape_160,this.shape_159,this.shape_158,this.shape_157,this.shape_156,this.shape_155,this.shape_154,this.shape_153,this.shape_152,this.shape_151,this.shape_150,this.shape_149,this.shape_148,this.shape_147,this.shape_146,this.shape_145,this.shape_144,this.shape_143,this.shape_142,this.shape_141,this.shape_140,this.shape_139,this.shape_138,this.shape_137,this.shape_136,this.shape_135,this.shape_134,this.shape_133,this.shape_132,this.shape_131,this.shape_130,this.shape_129,this.shape_128,this.shape_127,this.shape_126,this.shape_125,this.shape_124,this.shape_123,this.shape_122,this.shape_121,this.shape_120,this.shape_119,this.shape_118,this.shape_117,this.shape_116,this.shape_115,this.shape_114,this.shape_113,this.shape_112,this.shape_111,this.shape_110,this.shape_109,this.shape_108,this.shape_107,this.shape_106,this.shape_105,this.shape_104,this.shape_103,this.shape_102,this.shape_101,this.shape_100,this.shape_99,this.shape_98,this.shape_97,this.shape_96,this.shape_95,this.shape_94,this.shape_93,this.shape_92,this.shape_91,this.shape_90,this.shape_89,this.shape_88,this.shape_87,this.shape_86,this.shape_85,this.shape_84,this.shape_83,this.shape_82,this.shape_81,this.shape_80,this.shape_79,this.shape_78,this.shape_77,this.shape_76,this.shape_75,this.shape_74,this.shape_73,this.shape_72,this.shape_71,this.shape_70,this.shape_69,this.shape_68,this.shape_67,this.shape_66,this.shape_65,this.shape_64,this.shape_63,this.shape_62,this.shape_61,this.shape_60,this.shape_59,this.shape_58,this.shape_57,this.shape_56,this.shape_55,this.shape_54,this.shape_53,this.shape_52,this.shape_51,this.shape_50,this.shape_49,this.shape_48,this.shape_47,this.shape_46,this.shape_45,this.shape_44,this.shape_43,this.shape_42,this.shape_41,this.shape_40,this.shape_39,this.shape_38,this.shape_37,this.shape_36,this.shape_35,this.shape_34,this.shape_33,this.shape_32,this.shape_31,this.shape_30,this.shape_29,this.shape_28,this.shape_27,this.shape_26,this.shape_25,this.shape_24,this.shape_23,this.shape_22,this.shape_21,this.shape_20,this.shape_19,this.shape_18,this.shape_17,this.shape_16,this.shape_15,this.shape_14,this.shape_13,this.shape_12,this.shape_11,this.shape_10,this.shape_9,this.shape_8,this.shape_7,this.shape_6,this.shape_5,this.shape_4,this.shape_3,this.shape_2,this.shape_1,this.shape,this.instance);
}).prototype = p = new cjs.Container();
p.nominalBounds = new cjs.Rectangle(-207.8,-253,417.1,452.5);


(lib.Flouršuflíklvl6 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":169});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_16 = function() {
		playSound("suflik_otvor");
	}
	this.frame_40 = function() {
		playSound("naber_sypke");
	}
	this.frame_86 = function() {
		playSound("vysyp_sypke");
	}
	this.frame_100 = function() {
		playSound("naber_sypke");
	}
	this.frame_140 = function() {
		playSound("vysyp_sypke");
	}
	this.frame_153 = function() {
		playSound("suflik_zatvor");
	}
	this.frame_162 = function() {
		playSound("lizicka_neg");
	}
	this.frame_169 = function() {
		this.stop();
		console.log('Flouršuflíklvl6');
		PokiSDK.happyTime(0.45);
		exportLevel();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(14).call(this.frame_14).wait(2).call(this.frame_16).wait(24).call(this.frame_40).wait(46).call(this.frame_86).wait(14).call(this.frame_100).wait(40).call(this.frame_140).wait(13).call(this.frame_153).wait(9).call(this.frame_162).wait(7).call(this.frame_169).wait(1));

	// úloha olej
	this.instance = new lib.Tween76();
	this.instance.setTransform(47.5,-426.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(170));

	// úloha soľ
	this.instance_1 = new lib.Tween72();
	this.instance_1.setTransform(-50.6,-421.7);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(170));

	// úloha flour
	this.instance_2 = new lib.Tween75();
	this.instance_2.setTransform(-152.5,-421.7);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(114));

	// Flour šúflík
	this.instance_3 = new lib.Flourtween();
	this.instance_3.setTransform(44.2,16.4);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(14).to({scaleX:1.1,scaleY:1.1},15).wait(130).to({scaleX:1,scaleY:1},10).wait(1));

	// Padajúca múka
	this.instance_4 = new lib.Padajúcamúka();
	this.instance_4.setTransform(-119.2,-80.6,1,1,0,0,0,2.2,8.9);
	this.instance_4.alpha = 0;
	this.instance_4._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(79).to({_off:false},0).to({alpha:1},4).to({x:-117.6,y:-67.6},8).to({x:-117.3,y:-65,alpha:0},3).to({_off:true},1).wait(38).to({_off:false,x:-119.2,y:-80.6},0).to({alpha:1},4).to({x:-117.6,y:-67.6},8).to({x:-117.3,y:-65,alpha:0},3).to({_off:true},1).wait(21));

	// Múka na ližičke
	this.instance_5 = new lib.Múkanaližičke();
	this.instance_5.setTransform(58,2.7,1,1,20,0,0,6.3,5);
	this.instance_5._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(54).to({_off:false},0).to({x:-121.3,y:-98.1},20).to({regY:4.9,rotation:40,x:-123.6,y:-91.8},5).to({alpha:0},4).to({_off:true},1).wait(24).to({_off:false,regY:5,rotation:20,x:58,y:2.7,alpha:1},0).to({x:-121.3,y:-98.1},20).to({regY:4.9,rotation:40,x:-123.6,y:-91.8},5).to({alpha:0},4).to({_off:true},1).wait(32));

	// Ližička
	this.instance_6 = new lib.Ližičkalvl3();
	this.instance_6.setTransform(-181.2,-30.6,1,1,0,0,0,27.2,3.7);

	this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(14).to({regX:27.3,regY:3.6,rotation:20,x:-14,y:-31.7},15).to({rotation:40,x:22.5,y:-0.9},12).to({x:38.7},7).to({regX:27.2,rotation:20,x:38.6},6).to({x:-140.6,y:-101.7},20).to({rotation:40,x:-140.5,y:-101.8},5).wait(12).to({regX:27.3,x:22.5,y:-0.9},8,cjs.Ease.get(-0.6)).to({x:38.7},3).to({regX:27.2,rotation:20,x:38.6},6).to({x:-140.6,y:-101.7},20).to({rotation:40,x:-140.5,y:-101.8},5).wait(15).to({regY:3.7,rotation:0,x:-181.2,y:-30.6},14).wait(8));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-208.4,-475.9,297.8,508.5);


(lib.Flouršuflík = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		playSound("suflik_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(3).call(this.frame_3).wait(11).call(this.frame_14).wait(1));

	// Flour šuflík
	this.instance = new lib.Flourtween();
	this.instance.setTransform(44.8,16.3);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1).to({scaleX:1.02,scaleY:1.02},4).to({scaleX:1,scaleY:1},3).to({scaleX:1.02,scaleY:1.02},3).to({scaleX:1,scaleY:1},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0.5,90,32);


(lib.zoomedIII = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		/* gotoAndPlay(2);*/
	}
	this.frame_1 = function() {
		playSound("ZoomSound");
	}
	this.frame_21 = function() {
		playSound("zmurk");
	}
	this.frame_55 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(20).call(this.frame_21).wait(34).call(this.frame_55).wait(1));

	// Layer 6 (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	var mask_graphics_10 = new cjs.Graphics().p("Al2AHIB3gcIJ2APIh4Acg");
	var mask_graphics_11 = new cjs.Graphics().p("Al2AHIB3gcIJ2APIh4Acg");
	var mask_graphics_12 = new cjs.Graphics().p("Al2AHIB3gcIJ2APIh4Acg");
	var mask_graphics_13 = new cjs.Graphics().p("Al2AHIB3gcIJ2APIh4Acg");
	var mask_graphics_14 = new cjs.Graphics().p("Al2AHIB3gcIJ2APIh4Acg");
	var mask_graphics_15 = new cjs.Graphics().p("Al2AHIB3gcIJ2APIh4Acg");
	var mask_graphics_16 = new cjs.Graphics().p("Al2AHIB3gcIJ2APIh4Acg");
	var mask_graphics_17 = new cjs.Graphics().p("Al2AHIB3gcIJ2APIh4Acg");
	var mask_graphics_18 = new cjs.Graphics().p("Al2AHIB3gcIJ2APIh4Acg");
	var mask_graphics_19 = new cjs.Graphics().p("Al2AHIB3gcIJ2APIh4Acg");
	var mask_graphics_20 = new cjs.Graphics().p("Al2AHIB3gcIJ2APIh4Acg");
	var mask_graphics_21 = new cjs.Graphics().p("ARmdYIB0h5IJ6AjIh0B7g");
	var mask_graphics_22 = new cjs.Graphics().p("ARndyIBqjUIJ9A3IhqDYg");
	var mask_graphics_23 = new cjs.Graphics().p("ARteMIBakvIKDBLIhaE0g");
	var mask_graphics_24 = new cjs.Graphics().p("AR3elIBFmJIKKBgIhEGPg");
	var mask_graphics_25 = new cjs.Graphics().p("ASGe+IAqnhIKUBzIgoHpg");
	var mask_graphics_26 = new cjs.Graphics().p("AR7esIA+mhIKNBkIg9Gog");
	var mask_graphics_27 = new cjs.Graphics().p("ARyeZIBPlgIKHBWIhPFmg");
	var mask_graphics_28 = new cjs.Graphics().p("ARseHIBdkfIKCBHIhdEkg");
	var mask_graphics_29 = new cjs.Graphics().p("ARod0IBojdIJ+A4IhoDhg");
	var mask_graphics_30 = new cjs.Graphics().p("ARmdhIBxibIJ7ApIhxCeg");
	var mask_graphics_31 = new cjs.Graphics().p("ARndOIB2hYIJ5AaIh2Bag");
	var mask_graphics_32 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_33 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_34 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_35 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_36 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_37 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_38 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_39 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_40 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_41 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_42 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_43 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_44 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_45 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_46 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_47 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_48 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_49 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_50 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_51 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_52 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_53 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");
	var mask_graphics_54 = new cjs.Graphics().p("ARrc8IB3gXIJ4ALIh4AXg");

	this.timeline.addTween(cjs.Tween.get(mask).to({graphics:null,x:0,y:0}).wait(10).to({graphics:mask_graphics_10,x:339,y:371.7}).wait(1).to({graphics:mask_graphics_11,x:339,y:371.7}).wait(1).to({graphics:mask_graphics_12,x:339,y:371.7}).wait(1).to({graphics:mask_graphics_13,x:339,y:371.7}).wait(1).to({graphics:mask_graphics_14,x:339,y:371.7}).wait(1).to({graphics:mask_graphics_15,x:339,y:371.7}).wait(1).to({graphics:mask_graphics_16,x:339,y:371.7}).wait(1).to({graphics:mask_graphics_17,x:339,y:371.7}).wait(1).to({graphics:mask_graphics_18,x:339,y:371.7}).wait(1).to({graphics:mask_graphics_19,x:339,y:371.7}).wait(1).to({graphics:mask_graphics_20,x:339,y:371.7}).wait(1).to({graphics:mask_graphics_21,x:187.6,y:191.7}).wait(1).to({graphics:mask_graphics_22,x:187.1,y:196.5}).wait(1).to({graphics:mask_graphics_23,x:186.6,y:201.3}).wait(1).to({graphics:mask_graphics_24,x:186.3,y:205.9}).wait(1).to({graphics:mask_graphics_25,x:186,y:210.5}).wait(1).to({graphics:mask_graphics_26,x:186.2,y:207.2}).wait(1).to({graphics:mask_graphics_27,x:186.4,y:203.8}).wait(1).to({graphics:mask_graphics_28,x:186.7,y:200.3}).wait(1).to({graphics:mask_graphics_29,x:187,y:196.8}).wait(1).to({graphics:mask_graphics_30,x:187.4,y:193.3}).wait(1).to({graphics:mask_graphics_31,x:187.8,y:189.8}).wait(1).to({graphics:mask_graphics_32,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_33,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_34,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_35,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_36,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_37,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_38,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_39,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_40,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_41,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_42,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_43,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_44,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_45,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_46,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_47,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_48,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_49,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_50,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_51,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_52,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_53,x:188.3,y:186.3}).wait(1).to({graphics:mask_graphics_54,x:188.3,y:186.3}).wait(1).to({graphics:null,x:0,y:0}).wait(1));

	// žmurknutie
	this.instance = new lib.Tween130("synched",0);
	this.instance.setTransform(338.9,392.6);
	this.instance._off = true;

	this.instance_1 = new lib.Tween131("synched",0);
	this.instance_1.setTransform(338.9,392.6);
	this.instance_1._off = true;

	this.instance.mask = this.instance_1.mask = mask;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(10).to({_off:false},0).to({_off:true},4).wait(42));
	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(10).to({_off:false},4).to({startPosition:0},17).to({startPosition:0},11).to({_off:true},1).wait(13));

	// Maska (mask)
	var mask_1 = new cjs.Shape();
	mask_1._off = true;
	var mask_1_graphics_0 = new cjs.Graphics().p("EgfnA4QMAAAhweMA/QAAAMAAABweg");
	var mask_1_graphics_54 = new cjs.Graphics().p("EgfnA4QMAAAhweMA/QAAAMAAABweg");

	this.timeline.addTween(cjs.Tween.get(mask_1).to({graphics:mask_1_graphics_0,x:192.4,y:142.7}).wait(54).to({graphics:mask_1_graphics_54,x:192.4,y:142.7}).wait(1).to({graphics:null,x:0,y:0}).wait(1));

	// pekárik
	this.instance_2 = new lib.Tween139_1("synched",0);
	this.instance_2.setTransform(305.2,724.3,1,1,9.4);

	this.instance_2.mask = mask_1;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({scaleX:1.28,scaleY:1.28,rotation:9.3,x:333.7,y:452.3},10).to({startPosition:0},4).to({startPosition:0},17).to({startPosition:0},11).to({scaleX:1,scaleY:1,rotation:9.4,x:305.4,y:724.3},12).to({_off:true},1).wait(1));

	// úloha vyber muffin
	this.instance_3 = new lib.Tween99("synched",0);
	this.instance_3.setTransform(337,-152.5);

	this.instance_3.mask = mask_1;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).to({x:337.2,y:-153},26).to({startPosition:0},5).to({startPosition:0},23).to({_off:true},1).wait(1));

	// úloha liať sirup
	this.instance_4 = new lib.Tween97("synched",0);
	this.instance_4.setTransform(242.2,-151.8);

	this.instance_4.mask = mask_1;

	this.timeline.addTween(cjs.Tween.get(this.instance_4).to({x:242.4,y:-152.3},26).to({startPosition:0},5).to({startPosition:0},23).to({_off:true},1).wait(1));

	// úloha zdrtit cukor
	this.instance_5 = new lib.Tween98("synched",0);
	this.instance_5.setTransform(142.1,-150.7);

	this.instance_5.mask = mask_1;

	this.timeline.addTween(cjs.Tween.get(this.instance_5).to({x:142.3,y:-151.2},26).to({startPosition:0},5).to({startPosition:0},23).to({_off:true},1).wait(1));

	// Toolbar
	this.instance_6 = new lib.Toolbarzoom();
	this.instance_6.setTransform(192.5,-148.4,1,1,0,0,0,202.5,68.8);

	this.instance_6.mask = mask_1;

	this.timeline.addTween(cjs.Tween.get(this.instance_6).to({_off:true},55).wait(1));

	// Maffinová forma
	this.instance_7 = new lib.ZoomIII();
	this.instance_7.setTransform(238.8,120.6,1,1,0,0,0,362.4,463.4);

	this.instance_7.mask = mask_1;

	this.timeline.addTween(cjs.Tween.get(this.instance_7).to({scaleX:1.19,scaleY:1.19,x:274.8,y:126},9).to({regY:463.2,scaleX:1.6,scaleY:1.6,x:349.2,y:129.3},17).wait(28).to({_off:true},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-10.1,-217.3,405,720);


(lib.pekárikcopy2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_9 = function() {
		playSound("kucharik_sup_von");
	}
	this.frame_39 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).wait(9).call(this.frame_9).wait(30).call(this.frame_39).wait(1));

	// Layer 1
	this.instance = new lib.kucharnewcopy();
	this.instance.setTransform(54,255.5,0.85,0.85,0,0,0,145.8,229.5);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(10).to({rotation:7,x:65.1,y:-104},8).to({y:-80.1},5).to({regY:229.6,scaleX:0.85,scaleY:0.85,rotation:16,x:82.7,y:-82.7},5).to({regY:229.5,scaleX:0.85,scaleY:0.85,rotation:7,x:65.1,y:-80.1},5).wait(7));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-70,60.5,248.2,390.2);


(lib.oceneniecopy = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		/* gotoAndPlay(2);*/
	}
	this.frame_16 = function() {
		playSound("Star3");
	}
	this.frame_21 = function() {
		playSound("Star2");
	}
	this.frame_26 = function() {
		playSound("Star1");
	}
	this.frame_37 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(16).call(this.frame_16).wait(5).call(this.frame_21).wait(5).call(this.frame_26).wait(11).call(this.frame_37).wait(1));

	// ZLATÁ VAREŠKA ANIM copy
	this.instance = new lib.ZLATÁHVIEZDA3("synched",0);
	this.instance.setTransform(329.2,89.6,0.097,0.097,-3.8);
	this.instance.alpha = 0;
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(18).to({_off:false},0).to({scaleX:1.06,scaleY:1.06,alpha:1},9).to({scaleX:0.95,scaleY:0.95,rotation:2.8},5).to({scaleX:1,scaleY:1,rotation:-2},5).wait(1));

	// ZLATÁ VAREŠKA ANIM
	this.instance_1 = new lib.ZLATÁHVIEZDA3("synched",0);
	this.instance_1.setTransform(185.5,46.4,0.097,0.097,-3.8);
	this.instance_1.alpha = 0;
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(13).to({_off:false},0).to({scaleX:1.06,scaleY:1.06,alpha:1},9).to({scaleX:0.95,scaleY:0.95,rotation:2.8,x:185.4},5).to({scaleX:1,scaleY:1,rotation:-2,x:185.3,y:46.5},5).to({startPosition:0},5).wait(1));

	// ZLATÁ VAREŠKA ANIM
	this.instance_2 = new lib.ZLATÁHVIEZDA3("synched",0);
	this.instance_2.setTransform(41.1,89.3,0.09,0.09,-3.8,0,0,-0.6,-0.1);
	this.instance_2.alpha = 0;
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(9).to({_off:false},0).to({regX:0,regY:0,scaleX:1.06,scaleY:1.06,x:41.7,y:89.5,alpha:1},9).to({scaleX:0.95,scaleY:0.95,rotation:2.8,x:41.8,y:89.6},5).to({scaleX:1,scaleY:1,rotation:-2,x:41.7,y:89.7},5).to({startPosition:0},9).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = null;


(lib.drvičkalvl14 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":74});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("drvicka_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_50 = function() {
		playSound("liatie_na_maffin");
	}
	this.frame_88 = function() {
		playSound("drvicka_stol");
	}
	this.frame_89 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(36).call(this.frame_50).wait(38).call(this.frame_88).wait(1).call(this.frame_89).wait(1));

	// úloha vzlievanie sirupu
	this.instance = new lib.Tween112("synched",0);
	this.instance.setTransform(28.9,-449.2);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({startPosition:0},34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(34));

	// drvička mimo mysky
	this.instance_1 = new lib.Tween114("synched",0);
	this.instance_1.setTransform(5.7,-7.8);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(15).to({_off:false},0).to({rotation:-72.2,x:-58.5,y:35.4},12).to({startPosition:0},62).wait(1));

	// vylievanie sirupu
	this.instance_2 = new lib.Tween115("synched",0);
	this.instance_2.setTransform(118.1,-15.2,1,0.075,-28.7,0,0,0.1,-15.2);
	this.instance_2.alpha = 0;
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(49).to({_off:false},0).to({regY:-15.1,scaleY:0.9,rotation:0,y:-15.3,alpha:1},5).to({startPosition:0},7).to({regY:-15.2,scaleY:0.08,rotation:-28.7,x:118.7,y:12.3,alpha:0},13).to({_off:true},1).wait(15));

	// deko poleva
	this.instance_3 = new lib.Tween116("synched",0);
	this.instance_3.setTransform(116.8,11.6,0.358,0.158,0,0,0,0.1,-8.8);
	this.instance_3.alpha = 0;
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(54).to({_off:false},0).to({regY:-9.1,scaleX:1,scaleY:1,y:11.5,alpha:1},34).to({startPosition:0},1).wait(1));

	// sirup
	this.instance_4 = new lib.Tween108("synched",0);
	this.instance_4.setTransform(32.6,16.9,1,1,0,0,0,0,4.2);

	this.timeline.addTween(cjs.Tween.get(this.instance_4).to({rotation:-2,x:32.5},1).to({rotation:2,x:32.6},4).to({regX:0.1,rotation:-1,y:17},3).to({regX:-0.1,rotation:1,y:16.9},3).to({regX:0,rotation:0},3).to({startPosition:0},15).to({regX:-0.1,regY:4.1,rotation:41.2,x:85.4,y:-34},15).to({regX:0.3,regY:4.4,scaleX:0.49,scaleY:0.34,rotation:38.5,x:107.7,y:-21.5},5).to({startPosition:0},23).to({regX:-0.1,regY:4.1,scaleX:1,scaleY:1,rotation:41.2,x:85.4,y:-34},6).to({regX:0,regY:4.2,scaleX:0.83,scaleY:0.69,rotation:0,x:-82.9,y:-8.7},11).wait(1));

	// drvička
	this.instance_5 = new lib.Tween104("synched",0);
	this.instance_5.setTransform(10.6,2.3,1.6,1.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_5).to({rotation:-2,x:10.1,y:3.1},1).to({rotation:2,x:11.2,y:1.5},4).to({rotation:-1,x:10.3,y:2.7},3).to({rotation:1,x:10.9,y:1.9},3).to({rotation:0,x:10.6,y:2.3},2).to({_off:true},1).wait(76));

	// Drvička myska
	this.instance_6 = new lib.Tween103("synched",0);
	this.instance_6.setTransform(33.2,25.8,1.603,1.603);

	this.timeline.addTween(cjs.Tween.get(this.instance_6).to({rotation:-2,x:33.4},1).to({rotation:2,x:32.9},4).to({rotation:-1,x:33.3},3).to({rotation:1,x:33.1},3).to({rotation:0,x:33.2},3).to({startPosition:0},15).to({rotation:41.2,x:80.1,y:-26.9},15).to({rotation:46.4,x:88.7},5).to({startPosition:0},23).to({rotation:41.2,x:80.1},6).to({rotation:0,x:-82.3,y:0.1},11).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-9.2,-493,76,543.1);


(lib.drvičkalvl13 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":92});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("drvicka_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
		playSound("drvicka_tah");
	}
	this.frame_39 = function() {
		playSound("drvenie_cukru");
	}
	this.frame_111 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(25).call(this.frame_39).wait(72).call(this.frame_111).wait(1));

	// úloha drvenie
	this.instance = new lib.Tween98("synched",0);
	this.instance.setTransform(138.9,-539.1);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({x:138.8},34).to({scaleX:1.02,scaleY:1.02,x:139.1,y:-539.2},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},11).to({_off:true},1).wait(61));

	// cukor
	this.instance_1 = new lib.Tween100("synched",0);
	this.instance_1.setTransform(36.7,-80,1.6,1.6,0,0,0,0,3);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({rotation:-2,x:36.6},1).to({rotation:2,x:36.8},4).to({rotation:-1,x:36.7},3).to({rotation:1,x:36.8},3).to({rotation:0,x:36.7},3).to({x:142.9},15).to({startPosition:0},15).to({scaleX:1.57,scaleY:1.57},2).to({startPosition:0},10).to({regY:2.9,scaleX:1.48,scaleY:1.42,y:-80.1},2).to({startPosition:0},9).to({scaleX:1.36,scaleY:1.18,y:-80},2).to({startPosition:0},9).to({scaleX:1.22,scaleY:1.01},2).to({startPosition:0},11).to({scaleX:1.01,scaleY:0.56},2).to({startPosition:0},9).to({regY:3,scaleX:0.59,scaleY:0.26},2).to({startPosition:0},7).wait(1));

	// Drvička zvlášť
	this.instance_2 = new lib.Tween101("synched",0);
	this.instance_2.setTransform(116,-105.5,1.6,1.6);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(30).to({_off:false},0).to({rotation:16,x:141.4,y:-152.9},12).to({y:-102.6},3).to({y:-152.9},9).to({y:-102.6},3).to({y:-152.9},8).to({y:-102.6},3).to({y:-152.9},8).to({y:-102.6},3).to({y:-152.9},10).to({y:-102.6},3).to({y:-152.9},8).to({y:-102.6},4).to({rotation:0,x:115.4,y:-105.5},6).to({_off:true},1).wait(1));

	// Drvička zvlášt dnuka
	this.instance_3 = new lib.Tween104("synched",0);
	this.instance_3.setTransform(14.7,-94.4,1.6,1.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).to({rotation:-2,x:14.1,y:-93.6},1).to({rotation:2,x:15.3,y:-95.2},4).to({rotation:-1,x:14.4,y:-94},3).to({rotation:1,x:15,y:-94.8},3).to({rotation:0,x:14.7,y:-94.4},3).to({x:120.9},15).to({_off:true},1).wait(81).to({_off:false},0).wait(1));

	// Drvička myska
	this.instance_4 = new lib.Tween103("synched",0);
	this.instance_4.setTransform(37.3,-71,1.603,1.603);

	this.timeline.addTween(cjs.Tween.get(this.instance_4).to({rotation:-2,x:37.5},1).to({rotation:2,x:37.1},4).to({rotation:-1,x:37.4},3).to({rotation:1,x:37.2},3).to({rotation:0,x:37.3},3).to({x:143.4},15).to({startPosition:0},82).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(4,-580.9,172.9,534.2);


(lib.drvič = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":78});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_1 = function() {
		playSound("drvicka_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_30 = function() {
		playSound("drvicka_stol");
	}
	this.frame_78 = function() {
		this.stop();
		console.log('drvič');
		PokiSDK.happyTime(0.65);
		exportLevel();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(13).call(this.frame_14).wait(16).call(this.frame_30).wait(48).call(this.frame_78).wait(1));

	// úloha vyber muffin
	this.instance = new lib.Tween99("synched",0);
	this.instance.setTransform(-133.9,-510.3);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(43).to({_off:false},0).to({rotation:360,x:266.9,y:-511.2},19).to({startPosition:0},16).wait(1));

	// úloha liať sirup
	this.instance_1 = new lib.Tween97("synched",0);
	this.instance_1.setTransform(-129,-509.6);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(48).to({_off:false},0).to({rotation:360,x:171.9,y:-510.5},19).to({startPosition:0},11).wait(1));

	// úloha zdrtit cukor
	this.instance_2 = new lib.Tween98("synched",0);
	this.instance_2.setTransform(-129,-508.5);
	this.instance_2._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(53).to({_off:false},0).to({rotation:360,x:71.9,y:-509.5},19).to({startPosition:0},6).wait(1));

	// úloha cukor
	this.instance_3 = new lib.Tween79();
	this.instance_3.setTransform(-129,-510.3);
	this.instance_3._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(58).to({_off:false},0).to({rotation:360,x:-21.9},19).wait(2));

	// úloha drvička
	this.instance_4 = new lib.Tween95("synched",0);
	this.instance_4.setTransform(271.8,-511.2);

	this.timeline.addTween(cjs.Tween.get(this.instance_4).to({startPosition:0},29).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(28));

	// drvič
	this.instance_5 = new lib.Tween1copy2("synched",0);
	this.instance_5.setTransform(23.9,15.2,1.283,1.283);

	this.timeline.addTween(cjs.Tween.get(this.instance_5).to({rotation:2},1).to({rotation:-2},4).to({rotation:2},3).to({rotation:-1},3).to({rotation:0},3).to({x:-24.5,y:-124.9},17).to({startPosition:0},19).to({startPosition:0},28).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(3.1,-551.1,306.7,585.6);


(lib.cukorlvl12 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":274});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		playSound("suflik_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}
	this.frame_15 = function() {
		playSound("suflik_otvor");
	}
	this.frame_44 = function() {
		playSound("naber_sypke");
	}
	this.frame_81 = function() {
		playSound("vysyp_sypke");
	}
	this.frame_116 = function() {
		playSound("naber_sypke");
	}
	this.frame_151 = function() {
		playSound("vysyp_sypke");
	}
	this.frame_192 = function() {
		playSound("naber_sypke");
	}
	this.frame_228 = function() {
		playSound("vysyp_sypke");
	}
	this.frame_262 = function() {
		playSound("suflik_zatvor");
	}
	this.frame_274 = function() {
		this.stop();
		console.log('cukorlvl12');
		exportLevel();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(3).call(this.frame_3).wait(11).call(this.frame_14).wait(1).call(this.frame_15).wait(29).call(this.frame_44).wait(37).call(this.frame_81).wait(35).call(this.frame_116).wait(35).call(this.frame_151).wait(41).call(this.frame_192).wait(36).call(this.frame_228).wait(34).call(this.frame_262).wait(12).call(this.frame_274).wait(1));

	// úloha vyber muffin
	this.instance = new lib.Tween99("synched",0);
	this.instance.setTransform(196.4,-435);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({startPosition:0},274).wait(1));

	// úloha liať sirup
	this.instance_1 = new lib.Tween97("synched",0);
	this.instance_1.setTransform(101.5,-434.3);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({startPosition:0},274).wait(1));

	// úloha zdrtit cukor
	this.instance_2 = new lib.Tween98("synched",0);
	this.instance_2.setTransform(1.5,-433.2);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).to({startPosition:0},274).wait(1));

	// úloha cukor
	this.instance_3 = new lib.Tween79();
	this.instance_3.setTransform(-92.2,-434.1);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(29).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(224));

	// cukor
	this.instance_4 = new lib.Sugartween();
	this.instance_4.setTransform(58.2,21.2,1.28,1.28);

	this.timeline.addTween(cjs.Tween.get(this.instance_4).to({scaleX:1.31,scaleY:1.31},1).to({scaleX:1.28,scaleY:1.28},4).to({scaleX:1.3,scaleY:1.3},3).to({scaleX:1.28,scaleY:1.28},3).wait(3).to({scaleX:1.5,scaleY:1.5},15).wait(239).to({scaleX:1.28,scaleY:1.28},6).wait(1));

	// maska sypany cukor (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	var mask_graphics_0 = new cjs.Graphics().p("Ag9A9QgagCAAgDIAPgTIAIgGIAGgHQAVgiAMgTQAXgiAOAAQAQAAARAZQALAPANAbQAGAMAGAVQAGARAAABIABABQAAADgaACQgaADgkAAQgjAAgagDg");
	var mask_graphics_168 = new cjs.Graphics().p("Ag9A9QgagCAAgDIAPgTIAIgGIAGgHQAVgiAMgTQAXgiAOAAQAQAAARAZQALAPANAbQAGAMAGAVQAGARAAABIABABQAAADgaACQgaADgkAAQgjAAgagDg");
	var mask_graphics_192 = new cjs.Graphics().p("Ag9A9QgagCAAgDIAPgTIAIgGIAGgHQAVgiAMgTQAXgiAOAAQAQAAARAZQALAPANAbQAGAMAGAVQAGARAAABIABABQAAADgaACQgaADgkAAQgjAAgagDg");
	var mask_graphics_244 = new cjs.Graphics().p("Ag9A9QgagCAAgDIAPgTIAIgGIAGgHQAVgiAMgTQAXgiAOAAQAQAAARAZQALAPANAbQAGAMAGAVQAGARAAABIABABQAAADgaACQgaADgkAAQgjAAgagDg");

	this.timeline.addTween(cjs.Tween.get(mask).to({graphics:mask_graphics_0,x:-94.2,y:-56.6}).wait(168).to({graphics:mask_graphics_168,x:-94.2,y:-56.6}).wait(24).to({graphics:mask_graphics_192,x:-94.2,y:-56.6}).wait(52).to({graphics:mask_graphics_244,x:-94.2,y:-56.6}).wait(31));

	// sypaný cukor
	this.instance_5 = new lib.padajúcicukor();
	this.instance_5.setTransform(-90.1,-60,1.079,0.7,0,0,180,2.1,9);
	this.instance_5.alpha = 0;
	this.instance_5._off = true;

	this.instance_5.mask = mask;

	this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(78).to({_off:false},0).to({scaleY:0.63,x:-92.7,y:-56.1,alpha:1},5).to({scaleX:2.02,scaleY:0.35,x:-94.3,y:-46.9},11).to({_off:true},1).wait(57).to({_off:false,scaleX:1.08,scaleY:0.7,x:-90.1,y:-60,alpha:0},0).to({scaleY:0.63,x:-92.7,y:-56.1,alpha:1},5).to({scaleX:2.02,scaleY:0.35,x:-94.3,y:-46.9},11).to({_off:true},1).wait(59).to({_off:false,scaleX:1.08,scaleY:0.7,x:-90.1,y:-60,alpha:0},0).to({scaleY:0.63,x:-92.7,y:-56.1,alpha:1},5).to({scaleX:2.02,scaleY:0.35,x:-94.3,y:-46.9},11).to({_off:true},1).wait(30));

	// cukor na ližičke
	this.instance_6 = new lib.cukornaližičke();
	this.instance_6.setTransform(40.9,4.1,1.188,1.221,0,-22.9,157.1,6,5.2);
	this.instance_6._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(51).to({_off:false},0).to({skewX:3.3,skewY:183.3,x:0,y:-109.7},11).to({skewX:-16.4,skewY:163.6,x:-83.3,y:-62.8},10).to({regX:6.1,skewX:-26.6,skewY:153.4,x:-86.4,y:-69.2},4).to({regY:5.1,scaleY:0.58,x:-89.5,y:-63.7,alpha:0},5).to({_off:true},1).wait(41).to({_off:false,regX:6,regY:5.2,scaleY:1.22,skewX:-22.9,skewY:157.1,x:40.9,y:4.1,alpha:1},0).to({skewX:3.3,skewY:183.3,x:0,y:-109.7},13).to({skewX:-16.4,skewY:163.6,x:-83.3,y:-62.8},10).to({regX:6.1,skewX:-26.6,skewY:153.4,x:-86.4,y:-69.2},4).to({regY:5.1,scaleY:0.58,x:-89.5,y:-63.7,alpha:0},5).to({_off:true},1).wait(43).to({_off:false,regX:6,regY:5.2,scaleY:1.22,skewX:-22.9,skewY:157.1,x:40.9,y:4.1,alpha:1},0).to({skewX:3.3,skewY:183.3,x:0,y:-109.7},13).to({skewX:-16.4,skewY:163.6,x:-83.3,y:-62.8},10).to({regX:6.1,skewX:-26.6,skewY:153.4,x:-86.4,y:-69.2},4).to({regY:5.1,scaleY:0.58,x:-89.5,y:-63.7,alpha:0},5).to({_off:true},1).wait(43));

	// Ližička 1/2
	this.instance_7 = new lib.Ližičkalvl3();
	this.instance_7.setTransform(75.5,9.6,1.283,1.283,0,0,180,27.2,3.7);
	this.instance_7._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_7).wait(29).to({_off:false},0).to({regY:3.8,skewX:-60.7,skewY:119.3,x:106,y:-55.9},10).to({skewX:-43.2,skewY:136.8,x:81.3,y:-7.6},7).to({x:60.1,y:-9.4},5).to({skewX:-17,skewY:163,x:23.2,y:-113.3},11).to({regY:3.7,skewX:-36.7,skewY:143.3,x:-62.8,y:-74},10).to({skewX:-47,skewY:133,x:-68.1,y:-84},4).wait(13).to({skewX:-36.7,skewY:143.3,x:-62.8,y:-74},5).to({regY:3.8,skewX:-17,skewY:163,x:23.2,y:-113.3},10).to({skewX:-43.2,skewY:136.8,x:81.3,y:-7.6},12).to({x:60.1,y:-9.4},7).to({skewX:-17,skewY:163,x:23.2,y:-113.3},13).to({regY:3.7,skewX:-36.7,skewY:143.3,x:-62.8,y:-74},10).to({skewX:-47,skewY:133,x:-68.1,y:-84},4).wait(11).to({skewX:-36.7,skewY:143.3,x:-62.8,y:-74},7).to({regY:3.8,skewX:-17,skewY:163,x:23.2,y:-113.3},12).to({skewX:-43.2,skewY:136.8,x:81.3,y:-7.6},12).to({x:60.1,y:-9.4},7).to({skewX:-17,skewY:163,x:23.2,y:-113.3},13).to({regY:3.7,skewX:-36.7,skewY:143.3,x:-62.8,y:-74},10).to({skewX:-47,skewY:133,x:-68.1,y:-84},4).wait(11).to({skewX:-36.7,skewY:143.3,x:-62.8,y:-74},7).to({regY:3.8,skewX:-17,skewY:163,x:23.2,y:-113.3},12).to({regY:3.7,skewX:0,skewY:180,x:75.5,y:9.6},12).to({_off:true},1).wait(6));

	// naberaný cukor
	this.instance_8 = new lib.Tween100("synched",0);
	this.instance_8.setTransform(-95.1,-50.2,0.216,0.135,0,0,0,0,3);
	this.instance_8.alpha = 0;
	this.instance_8._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_8).wait(89).to({_off:false},0).to({regX:0.1,scaleX:0.59,scaleY:0.37,alpha:1},5).to({startPosition:0},67).to({scaleX:0.81,scaleY:0.62},7).to({startPosition:0},69).to({scaleX:1,scaleY:1},7).to({startPosition:0},30).wait(1));

	// drvička
	this.instance_9 = new lib.Tween1copy2("synched",0);
	this.instance_9.setTransform(-94.8,-48.7,1.283,1.283);

	this.instance_10 = new lib.Tween1("synched",0);
	this.instance_10.setTransform(-94.8,-48.7,1.283,1.283);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_9}]}).to({state:[{t:this.instance_10}]},274).wait(1));
	this.timeline.addTween(cjs.Tween.get(this.instance_9).to({_off:true},274).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-137.1,-475,376.3,516.7);


(lib.credits_symbol = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_9 = function() {
		this.stop();
		
		var openCredits = this;
		
		this.b2credits.on("click", creditsF2);
		
		
		function creditsF2(evt) 
		
				{
					stage.removeChild(text1);
					stage.removeChild(text2);
					openCredits.gotoAndStop(0);
				}
		var texty = this;
		
		var text1 = stage.addChild(new createjs.Text(" ", "25px Calibri", "#111"))
		var text2 = new createjs.Text("This game including, but not limited to, all texts, images, audio and source code is our copyright protected material and property of Functu(TM). No content of this game may be copied, reproduced, republished, uploaded, distributed, posted, publicly displayed, ported to different platforms or otherwise used without our written permission. When someone infringes our rights, we dedicate considerable resources to enforce them. Through the competent judicial authorities we seek damages, compensation of non-material damages, recovery of profits one gained through the infringing use of our copyright protected material as well as the recovery of legal costs and other expenses incurred when enforcing our rights. We also demand dissemination of the judicial decision, at the expense of the infringer. If you have any questions, please contact us at: Andrascik s.r.o. / Jabloňová 27 / 082 56 Pečovská Nová Ves / Slovakia / Email: peter@functu.com / Website: www.functu.com ", "25px Calibri", "#111");
		stage.addChild(text2);
		text2.x = 405;
		text2.y = 600;
		createjs.Tween.get(text1).call(txtAnim1)
		
		
		function txtAnim1() 
			{
			createjs.Tween.get(text2).to({x:-10000},150000).to({x:9595}, 0).call(txtAnim1);
			}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(9).call(this.frame_9).wait(1));

	// button
	this.b2credits = new lib.l1b4();
	this.b2credits.setTransform(70.6,120.4,3.944,7.317,0,0,0,-0.1,0.2);
	this.b2credits._off = true;
	new cjs.ButtonHelper(this.b2credits, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get(this.b2credits).wait(9).to({_off:false},0).wait(1));

	// logo
	this.shape = new cjs.Shape();
	this.shape.graphics.f("#E95632").s().p("AOBCqQgGgCgEgGQgDgFAAgHQAAgEACgEIAjhOIg4h2QgCgEAAgFQAAgGADgFQADgGAGgCQAEgCAFAAQAOAAAGAMIAqBXIAqhXQAGgMANAAQAFAAAEACQAGACAEAGQADAFAAAGQAAAFgDAEIg9B/IgDAFIglBSQgCAFgGAEQgFADgGAAQgGAAgDgCgAwBCsQgSgCgRgJIgOgMIgMgPQgEgFAAgGQAAgLAKgHQAGgEAGAAQALAAAHAKQAFAIAHAEQAIAFAIABIACAAQAIAAAHgEQAHgDAGgHQAFgFADgIQACgIAAgIIAAgKQgJAFgJADQgJACgKAAQgRAAgPgHQgPgHgLgMQgLgLgGgQQgGgQAAgRQAAgQAGgQQAGgQALgMQALgLAPgHQAPgHARABQAKAAALACQAKADAJAGQAGgLANAAQAJAAAGAFQAGAHAAAJIAACVQAAAPgFAPQgFAPgKAMQgLAOgQAIQgQAHgSAAgAwKgmQgHADgFAGQgFAGgDAHQgDAJAAAHQAAAJADAHQADAIAFAGQAFAGAHAEQAHACAIAAQAHAAAHgCQAHgEAFgGQAFgGADgIQADgHAAgJQAAgHgDgJQgDgHgFgGQgFgGgHgDQgHgEgHAAQgIAAgHAEgAQoBPQgGgFAAgKQAAgIAGgHQAHgGAJgBQAJABAGAGQAGAHAAAIQAAAKgGAFQgGAHgJAAQgJAAgHgHgALbBTQgKgDgJgFQgGALgNAAQgJAAgGgHQgGgFAAgKIAAjWQAAgIAGgGQAGgHAJAAQAJAAAGAHQAHAGAAAIIAABLQAIgEAKgDQAKgCAKAAQAQgBAPAHQAOAHAMALQALAMAGAQQAGAQAAAQQAAARgGAQQgGAQgLALQgMAMgOAHQgPAHgQAAQgLAAgLgDgALigmQgHADgFAGQgFAGgDAIQgDAIAAAHQAAAJADAHQADAIAFAGQAFAGAHAEQAHACAIAAQAHAAAHgCQAHgEAFgGQAFgGADgIQADgHAAgJQAAgHgDgIQgDgIgFgGQgFgGgHgDQgHgEgHAAQgIAAgHAEgAHSBWQgRgCgOgGQgOgIgLgMQgJgMgEgOQgFgQAAgQQAAgQAGgQQAGgQAKgMQALgLANgHQAOgHAQABQAPAAAOAFQAOAHALALQAKAMAFAPQAGAPAAARQAAAGgGAHQgHAGgIAAIhUAAQADALAGAGQAIAJANgBIACAAQAQAAAKgGQAFgDAHAAQALgBAHAKQADAFAAAHQAAAMgKAGQgLAIgPAEQgKACgKAAgAHvgYQgEgIgHgFQgHgFgJAAQgIAAgHAFQgHAFgEAIIA1AAIAAAAgAFJBSQgFgDgDgGQgKAHgLACQgMAEgMAAQgRAAgQgHQgQgHgMgMQgMgLgGgQQgHgQAAgRQAAgQAHgQQAGgQAMgMQAMgLAQgHQAQgHARABQAMAAALACQALADAKAGIAAhNQAAgIAGgGQAGgHAJAAQAJAAAGAHQAHAGAAAIIAADWQAAAKgHAFQgGAHgJAAQgGAAgGgEgAEEgmQgIADgGAGQgGAGgDAIQgEAIAAAHQAAAJAEAHQADAIAGAGQAGAGAIAEQAIACAIAAQAJAAAIgCQAIgEAGgGQAGgGADgIQAEgHAAgJQAAgHgEgIQgDgIgGgGQgGgGgIgDQgIgEgJAAQgIAAgIAEgAB4BKQgMAGgOADIgXADQgMAAgKgEQgKgCgHgGQgIgFgFgJQgFgIgDgKIgBgMQAAgRAJgMQAIgJANgFQAJgEAKgDQAMgDAOAAIAfABQgCgMgGgDQgIgFgKAAQgKABgKAEQgKADgGAFQgGAFgIAAQgKAAgGgIQgFgFAAgJQAAgKAIgGQALgKANgFQAOgFAOgCIAKAAQALAAALACQAKADAIAEQAeARABArIAABPQAAAJgGAGQgGAHgJAAQgOAAgFgMgAA/AWQgHACgCACIgCAEIABACQACALAQgBIAOgBIACAAQAJgCAHgGQAGgEADgGIACgFIgfAAQgMABgIADgAg3BPQgGgFAAgKIAAhSQAAgHgEgIQgEgIgKgBQgLABgEAIQgDAIAAAHIAABSQAAAKgGAFQgHAHgJAAQgJAAgGgHQgGgFAAgKIAAhSQAAgHgDgIQgFgIgKgBQgKABgEAIQgEAIAAAHIAABSQAAAKgGAFQgGAHgJAAQgJAAgHgHQgGgFAAgKIAAh/QAAgJAGgHQAHgFAJAAQAHAAAHAEQALgEAOAAQAMAAALADQAJAEAHAGQAIgGAJgEQALgDAMAAQAQgBAMAHQALAGAIAKQAHAKAEANQADAKAAALIAABSQAAAKgHAFQgGAHgJAAQgJAAgGgHgAmoBWQgRgCgPgGQgOgIgKgMQgJgMgFgOQgEgQAAgQQAAgQAGgQQAFgQALgMQAKgLAOgHQAOgHAPABQAQAAAOAFQAOAHAKALQALAMAFAPQAFAPAAARQAAAGgGAHQgGAGgJAAIhUAAQADALAHAGQAIAJANgBIACAAQAQAAAJgGQAGgDAGAAQAMgBAGAKQAEAFAAAHQAAAMgKAGQgMAIgOAEQgKACgLAAgAmLgYQgEgIgIgFQgHgFgJAAQgIAAgHAFQgGAFgFAIIA2AAIAAAAgAo1BPQgGgFAAgKIAAhSQAAgHgEgIQgEgIgKgBQgLABgEAIQgDAIAAAHIAABSQAAAKgGAFQgHAHgJAAQgJAAgGgHQgGgFAAgKIAAhSQAAgHgDgIQgFgIgKgBQgKABgEAIQgEAIAAAHIAABSQAAAKgGAFQgGAHgJAAQgJAAgHgHQgGgFAAgKIAAh/QAAgJAGgHQAHgFAJAAQAHAAAHAEQALgEAOAAQAMAAALADQAJAEAHAGQAIgGAJgEQALgDAMAAQAQgBAMAHQALAGAIAKQAHAKAEANQADAKAAALIAABSQAAAKgHAFQgGAHgJAAQgJAAgGgHgAsfBKQgMAGgOADIgXADQgMAAgKgEQgKgCgHgGQgIgFgFgJQgFgIgDgKIgBgMQAAgRAJgMQAIgJANgFQAJgEAKgDQAMgDAOAAIAfABQgCgMgGgDQgIgFgKAAQgKABgKAEQgKADgGAFQgGAFgIAAQgKAAgGgIQgFgFAAgJQAAgKAIgGQALgKANgFQAOgFAOgCIAKAAQALAAALACQAKADAIAEQAeARABArIAABPQAAAJgGAGQgGAHgJAAQgOAAgFgMgAtYAWQgHACgCACIgCAEIABACQACALAQgBIAOgBIACAAQAJgCAHgGQAGgEADgGIACgFIgfAAQgMABgIADgAQogbQgGgFAAgKQAAgIAGgGQAHgHAJAAQAJAAAGAHQAGAGAAAIQAAAKgGAFQgGAHgJAAQgJAAgHgHg");
	this.shape.setTransform(198.6,195.1);

	this.instance = new lib.functu_logo();
	this.instance.setTransform(206.7,398.6,0.613,0.613,0,0,0,1.7,1.9);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[]}).to({state:[{t:this.instance},{t:this.shape}]},1).wait(9));

	// whiteBG
	this.instance_1 = new lib.biele_bg();
	this.instance_1.setTransform(320,240);
	this.instance_1._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1).to({_off:false},0).wait(9));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = null;


(lib.Bakingpšuflíklvl5 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"negF":1,"animF":15,"endF":133});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
		playSound("suflik_otvor");
	}
	this.frame_44 = function() {
		playSound("naber_sypke");
	}
	this.frame_83 = function() {
		playSound("vysyp_sypke");
	}
	this.frame_95 = function() {
		playSound("naber_sypke");
	}
	this.frame_116 = function() {
		playSound("suflik_zatvor");
	}
	this.frame_121 = function() {
		playSound("vysyp_sypke");
	}
	this.frame_129 = function() {
		playSound("lizicka_neg");
	}
	this.frame_133 = function() {
		this.stop();
		console.log('Bakingpšuflíklvl5');
		exportLevel();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(14).call(this.frame_14).wait(30).call(this.frame_44).wait(39).call(this.frame_83).wait(12).call(this.frame_95).wait(21).call(this.frame_116).wait(5).call(this.frame_121).wait(8).call(this.frame_129).wait(4).call(this.frame_133).wait(1));

	// úloha olej
	this.instance = new lib.Tween76();
	this.instance.setTransform(136.3,-426.3);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(134));

	// úloha soľ
	this.instance_1 = new lib.Tween72();
	this.instance_1.setTransform(38.2,-421.4);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(134));

	// úloha flour
	this.instance_2 = new lib.Tween75();
	this.instance_2.setTransform(-63.7,-421.4);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(134));

	// úloha baking p.
	this.instance_3 = new lib.Tween73();
	this.instance_3.setTransform(-162.9,-421.4);

	this.timeline.addTween(cjs.Tween.get(this.instance_3).wait(34).to({scaleX:1.02,scaleY:1.02},5).to({scaleX:0.1,scaleY:0.1,rotation:360,alpha:0},16).to({_off:true},1).wait(78));

	// Baking p. šuflík
	this.instance_4 = new lib.Bakingptween();
	this.instance_4.setTransform(44.3,16.6);

	this.timeline.addTween(cjs.Tween.get(this.instance_4).wait(14).to({scaleX:1.1,scaleY:1.1},15).to({x:44.4},19).to({x:44.3},68).to({scaleX:1,scaleY:1},8).wait(10));

	// Padajúce Baking p.
	this.instance_5 = new lib.PadajúciBakingp();
	this.instance_5.setTransform(-21.2,-74.8,1,1,0,0,0,2.2,8.8);
	this.instance_5.alpha = 0;
	this.instance_5._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_5).wait(74).to({_off:false},0).to({alpha:1},5).to({y:-66.9},5).to({y:-62.5,alpha:0},2).to({_off:true},1).wait(24).to({_off:false,y:-74.8},0).to({alpha:1},5).to({y:-66.9},5).to({y:-62.5,alpha:0},2).to({_off:true},1).wait(10));

	// Bakin p. na ližičke
	this.instance_6 = new lib.Bakingpnaližičke();
	this.instance_6.setTransform(62.3,3.4,1,1,0,0,0,6.2,5.3);
	this.instance_6._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance_6).wait(60).to({_off:false},0).to({regY:5.2,rotation:20,x:-26.7,y:-84.9},14).to({alpha:0},5).to({_off:true},1).wait(17).to({_off:false,regY:5.3,rotation:0,x:62.3,y:3.4,alpha:1},0).to({regY:5.2,rotation:20,x:-26.7,y:-84.9},14).to({alpha:0},5).to({_off:true},1).wait(17));

	// Ližička
	this.instance_7 = new lib.Ližičkalvl3();
	this.instance_7.setTransform(-92.4,-30.4,1,1,0,0,0,27.2,3.7);

	this.timeline.addTween(cjs.Tween.get(this.instance_7).wait(29).to({regY:3.6,rotation:50,x:3.5,y:-27.4},12).to({x:29.2,y:-0.3},7).to({x:42.1},6).to({rotation:20,x:44.2},6).to({regY:3.7,rotation:40,x:-42.5,y:-94.4},14).wait(10).to({regY:3.8,scaleX:1,scaleY:1,rotation:26.1,x:12.8,y:-4.1},9).to({regY:3.6,scaleX:1,scaleY:1,rotation:20,x:44.2,y:-0.3},4).to({regY:3.7,rotation:40,x:-42.5,y:-94.4},14).wait(10).to({rotation:0,x:-92.4,y:-30.4},12).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-207.7,-475.6,382.3,508.2);


(lib.Bakingpšuflík = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		playSound("suflik_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(3).call(this.frame_3).wait(11).call(this.frame_14).wait(1));

	// Baking p. šuflík
	this.instance = new lib.Bakingptween();
	this.instance.setTransform(45.7,16.6);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1).to({scaleX:1.02,scaleY:1.02},4).to({scaleX:1,scaleY:1},3).to({scaleX:1.02,scaleY:1.02},3).to({scaleX:1,scaleY:1},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0.9,0.6,90,32);


(lib.Bakingp = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":14});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
	}
	this.frame_3 = function() {
		playSound("suflik_neg");
	}
	this.frame_14 = function() {
		this.gotoAndPlay("startF");
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(3).call(this.frame_3).wait(11).call(this.frame_14).wait(1));

	// Baknig p. šuflík
	this.instance = new lib.Bakingptween();
	this.instance.setTransform(57.2,19.8,1.283,1.283);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1).to({scaleX:1.31,scaleY:1.31},4).to({scaleX:1.28,scaleY:1.28},3).to({scaleX:1.3,scaleY:1.3},3).to({scaleX:1.28,scaleY:1.28},3).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-0.4,-0.8,115.5,41.1);


(lib.background13 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":15});

	// timeline functions:
	this.frame_0 = function() {
		//this.stop();
	}
	this.frame_15 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(15).call(this.frame_15).wait(1));

	// background 1/3
	this.instance = new lib.Tween133("synched",0);
	this.instance.setTransform(240.1,81.9);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({scaleX:1.1,scaleY:1.1},5).to({scaleX:1.08,scaleY:1.08},4).to({scaleX:1.09,scaleY:1.09},4).to({scaleX:1.08,scaleY:1.08},2).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-380.4,-143.8,1241,451);


(lib.ĽavédvereLVL3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":19});

	// timeline functions:
	this.frame_0 = function() {
		//this.stop();
	}
	this.frame_1 = function() {
		playSound("dvere_otvor_2");
	}
	this.frame_24 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1).call(this.frame_1).wait(23).call(this.frame_24).wait(1));

	// Ľavé dvere lvl3
	this.instance = new lib.Ľavédverelvl3();
	this.instance.setTransform(2.9,83.8,1,1,0,0,0,-0.6,73.4);

	this.timeline.addTween(cjs.Tween.get(this.instance).to({regX:0,scaleX:0.05},19,cjs.Ease.get(-0.6)).to({_off:true},1).wait(5));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(3.5,10.4,109,147);


(lib.Ľavédverelvl5 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":24});

	// timeline functions:
	this.frame_0 = function() {
		//this.stop();
		playSound("dvere_zatvor");
	}
	this.frame_24 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(24).call(this.frame_24).wait(1));

	// Ľavé dvere
	this.instance = new lib.Ľavédverelvl3();
	this.instance.setTransform(5.3,80.4,0.05,1,0,0,0,1,74.4);
	this.instance._off = true;

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(4).to({_off:false},0).to({scaleX:1},20,cjs.Ease.get(-0.6)).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = null;


(lib.zoomedscene = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{"startF":0,"animF":1,"endF":34});

	// timeline functions:
	this.frame_0 = function() {
		//this.stop();
	}
	this.frame_4 = function() {
		playSound("zoom_sound");
	}
	this.frame_34 = function() {
		this.stop();
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(4).call(this.frame_4).wait(30).call(this.frame_34).wait(1));

	// maska (mask)
	var mask = new cjs.Shape();
	mask._off = true;
	var mask_graphics_0 = new cjs.Graphics().p("EgfoA4QMAAAhweMA/QAAAMAAABweg");
	var mask_graphics_33 = new cjs.Graphics().p("EgfoA4QMAAAhweMA/QAAAMAAABweg");

	this.timeline.addTween(cjs.Tween.get(mask).to({graphics:mask_graphics_0,x:125.8,y:-47.5}).wait(33).to({graphics:mask_graphics_33,x:125.8,y:-47.5}).wait(1).to({graphics:null,x:0,y:0}).wait(1));

	// úloha drvička
	this.instance = new lib.Tween95("synched",0);
	this.instance.setTransform(275.5,-342.7);

	this.instance.mask = mask;

	this.timeline.addTween(cjs.Tween.get(this.instance).to({startPosition:0},33).to({_off:true},1).wait(1));

	// úloha sirup
	this.instance_1 = new lib.Tween94("synched",0);
	this.instance_1.setTransform(175.6,-342.7);

	this.instance_1.mask = mask;

	this.timeline.addTween(cjs.Tween.get(this.instance_1).to({startPosition:0},33).to({_off:true},1).wait(1));

	// Layer 4
	this.instance_2 = new lib.Toolbarzoom_1();
	this.instance_2.setTransform(125.9,-338.7,1,1,0,0,0,202.5,68.8);

	this.instance_2.mask = mask;

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(33).to({_off:true},1).wait(1));

	// Place zoom
	this.instance_3 = new lib.PACE();
	this.instance_3.setTransform(114.7,-46.3,1,1,0,0,0,293.1,361.2);

	this.instance_3.mask = mask;

	this.timeline.addTween(cjs.Tween.get(this.instance_3).to({scaleX:1.01,scaleY:1.01,x:116.4,y:-48.5},9,cjs.Ease.get(-0.7)).to({regX:293,scaleX:1.28,scaleY:1.28,x:158.4,y:-69.8},24).to({_off:true},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-76.7,-407.5,405,720);


(lib.theend = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
		
		stopujI();
		
		
		this.breplay.on("click", funkciaEnd);
		
		function funkciaEnd(evt) 
		
			
			{
				if (_this.replay.getCurrentLabel() == "endF" )
		
					{
						window.location.reload();
					}
		
			}
			
		
		this.brecept.on("click", recipeF);
		
		function recipeF(evt) 
			
			{	
				if (_this.recept.timeline.position == 0)
				{
					_this.recept.gotoAndPlay(1);
				}
				
				if (_this.recept.timeline.position == 11)
				{
					_this.recept.gotoAndPlay(12);
				}
			}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// btn
	this.brecept = new lib.l1b4();
	this.brecept.setTransform(717.3,193.9,0.886,1.809,0,0,0,-0.2,1.4);
	new cjs.ButtonHelper(this.brecept, 0, 1, 2, false, new lib.l1b4(), 3);

	this.breplay = new lib.l1b4();
	this.breplay.setTransform(535.3,699.2,1.646,1.331,0,0,0,-0.1,1.5);
	new cjs.ButtonHelper(this.breplay, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.breplay},{t:this.brecept}]}).wait(1));

	// replay btn
	this.replay = new lib.replaybutton();
	this.replay.setTransform(579.8,773.4,0.797,0.797);

	this.timeline.addTween(cjs.Tween.get(this.replay).wait(1));

	// recipe
	this.recept = new lib.Symbol3();
	this.recept.setTransform(862.1,529.1,1,1,0,0,0,134.5,129.9);

	this.timeline.addTween(cjs.Tween.get(this.recept).wait(1));

	// stars
	this.hviezdičky = new lib.oceneniecopy();
	this.hviezdičky.setTransform(448,609.4,0.75,0.75);

	this.timeline.addTween(cjs.Tween.get(this.hviezdičky).wait(1));

	// table
	this.stôl = new lib.background13();
	this.stôl.setTransform(608.1,719.1,1,1,0,0,0,227.7,167);

	this.timeline.addTween(cjs.Tween.get(this.stôl).wait(1));

	// chief
	this.pekárik = new lib.pekárikcopy2();
	this.pekárik.setTransform(627,505,1,1,0,0,0,145,91);

	this.timeline.addTween(cjs.Tween.get(this.pekárik).wait(1));

	// bg
	this.instance = new lib.scórebackgroun();
	this.instance.setTransform(603.7,578.7,1,1,0,0,0,248,178.8);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(0,0,1241,864.7);


(lib.menucko = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
					
					
		this.bplay.on("click", funkcia01);
					
					
		// this.bcredits.on("click", creditsF);
		
		
		// function creditsF(evt) 
		
		// 		{
		// 			_this.credits.gotoAndPlay(1);
		// 		}
				
				
				
		// this.bmoregames.on("click", moreF);
		
		
		// function moreF(evt) 
		
		// 		{
		// 			moreFF();
		// 		}
		this.tt_1.text = t_lang[chosenL][0][0];
		this.tt_1.font = t_lang[chosenL][0][1];
		this.tt_1.color = t_lang[chosenL][0][2];
		this.tt_1.lineHeight = t_lang[chosenL][0][3];
		this.tt_1.lineWidth = t_lang[chosenL][0][4];
		this.tt_1.maxWidth = t_lang[chosenL][0][5];
		this.tt_1.textAlign = t_lang[chosenL][0][6];
		this.tt_1.textBaseline = t_lang[chosenL][0][7];
		this.tt_1.rotation = t_lang[chosenL][0][8];
		if ((t_lang[chosenL][0][9]) != null && 
			(t_lang[chosenL][0][10]) != null)
		{	
			this.tt_1.x = t_lang[chosenL][0][9];
			this.tt_1.y = t_lang[chosenL][0][10];
		}
		
		// this.tt_2.text = t_lang[chosenL][1][0];
		// this.tt_2.font = t_lang[chosenL][1][1];
		// this.tt_2.color = t_lang[chosenL][1][2];
		// this.tt_2.lineHeight = t_lang[chosenL][1][3];
		// this.tt_2.lineWidth = t_lang[chosenL][1][4];
		// this.tt_2.maxWidth = t_lang[chosenL][1][5];
		// this.tt_2.textAlign = t_lang[chosenL][1][6];
		// this.tt_2.textBaseline = t_lang[chosenL][1][7];
		// this.tt_2.rotation = t_lang[chosenL][1][8];
		// if ((t_lang[chosenL][1][9]) != null && 
		// 	(t_lang[chosenL][1][10]) != null)
		// {	
		// 	this.tt_2.x = t_lang[chosenL][1][9];
		// 	this.tt_2.y = t_lang[chosenL][1][10];
		// }
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// // credits
	// this.credits = new lib.credits_symbol();
	// this.credits.setTransform(365,207.5,1,1,0,0,0,365,207.5);

	// this.timeline.addTween(cjs.Tween.get(this.credits).wait(1));

	// // moreg
	// this.bmoregames = new lib.l1b4();
	// this.bmoregames.setTransform(216.1,14.4,1.461,0.783,0,0,0,-0.1,1.2);
	// new cjs.ButtonHelper(this.bmoregames, 0, 1, 2, false, new lib.l1b4(), 3);

	// this.moregames = new lib.moreg_sym();
	// this.moregames.setTransform(265.4,4,1,1,0,0,0,74.7,74.7);

	// this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.moregames},{t:this.bmoregames}]}).wait(1));

	// // btn
	// this.bcredits = new lib.l1b4();
	// this.bcredits.setTransform(155.2,656.6,1.461,0.783,0,0,0,-0.1,1.2);
	// new cjs.ButtonHelper(this.bcredits, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bplay = new lib.l1b4();
	this.bplay.setTransform(157.1,511.5,1.363,1.423,0,0,0,-0.1,0.6);
	new cjs.ButtonHelper(this.bplay, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.bplay}]}).wait(1));

	// obj
	// this.tt_2 = new cjs.Text("Credits", "42px 'Rancho'", "#FBEDD2");
	// this.tt_2.name = "tt_2";
	// this.tt_2.textAlign = "center";
	// this.tt_2.lineHeight = 50;
	// this.tt_2.lineWidth = 127;
	// this.tt_2.setTransform(202.1,667.3,1.003,1.003);

	this.tt_1 = new cjs.Text("Carrot Cake", "39px 'Rancho'", "#FBEDD2");
	this.tt_1.name = "tt_1";
	this.tt_1.lineHeight = 47;
	this.tt_1.lineWidth = 210;
	this.tt_1.setTransform(125.1,418.6,1.003,1.003);

	this.instance = new lib.Bitmap2();
	this.instance.setTransform(12.8,17);

	this.instance_1 = new lib.playbutton();
	this.instance_1.setTransform(212.9,566.1,1,1,0,0,0,70.1,32.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance},{t:this.tt_1}]}).wait(1));

	// bg
	this.instance_2 = new lib.Symbol2();
	this.instance_2.setTransform(203.5,400.8,1,1,0,0,0,192.5,279.8);

	this.timeline.addTween(cjs.Tween.get(this.instance_2).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-3.8,-70.7,427,863.4);


(lib.level14 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
		
		
		this.boven.on("click", funkcia104);
		this.bvaza.on("click", funkcia1001);
		this.btanier.on("click", funkcia1002);
		this.borange.on("click", funkcia1401);
		
		this.bmaziar.on("click", funkcia1402);
		this.bkolacik.on("click", funkcia1403);
		
		function funkcia104(evt) 
		
			
			{
				if (_this.oven.getCurrentLabel() == "startF" )
		
					{
						_this.oven.gotoAndPlay("animF");
					}
		
			}
		
			
		function funkcia1001(evt) 
		
			
			{
				if (_this.vaza.getCurrentLabel() == "startF" )
		
					{
						_this.vaza.gotoAndPlay("animF");
					}
		
			}
			
			
		function funkcia1002(evt) 
		
			
			{
				if (_this.tanier.getCurrentLabel() == "startF" )
		
					{
						_this.tanier.gotoAndPlay("animF");
					}
		
			}
			
		
		
		function funkcia1401(evt) 
		
			
			{
				if (_this.orange.getCurrentLabel() == "startF" )
		
					{
						_this.orange.gotoAndPlay("animF");
					}
		
			}
			
			
		function funkcia1402(evt) 
		
			
			{
				if (_this.maziar.getCurrentLabel() == "startF" && _this.tanier.timeline.position >= 36)
		
					{
						_this.maziar.gotoAndPlay("animF");
					}
				
				else if (_this.maziar.getCurrentLabel() == "startF" && _this.tanier.getCurrentLabel() == "startF")
		
					{
						_this.maziar.gotoAndPlay("negF");
					}
			}
			
		
		
		function funkcia1403(evt) 
		
			
			{
				if (_this.kolacik.getCurrentLabel() == "startF" && _this.maziar.timeline.position >= 74)
		
					{
						_this.kolacik.gotoAndPlay("animF");
					}
				
				else if (_this.kolacik.getCurrentLabel() == "startF" && _this.maziar.getCurrentLabel() == "startF")
		
					{
						_this.kolacik.gotoAndPlay("negF");
					}
			}
		this.tt_24.text = t_lang[chosenL][23][0];
		this.tt_24.font = t_lang[chosenL][23][1];
		this.tt_24.color = t_lang[chosenL][23][2];
		this.tt_24.lineHeight = t_lang[chosenL][23][3];
		this.tt_24.lineWidth = t_lang[chosenL][23][4];
		this.tt_24.maxWidth = t_lang[chosenL][23][5];
		this.tt_24.textAlign = t_lang[chosenL][23][6];
		this.tt_24.textBaseline = t_lang[chosenL][23][7];
		this.tt_24.rotation = t_lang[chosenL][23][8];
		if ((t_lang[chosenL][23][9]) != null && 
			(t_lang[chosenL][23][10]) != null)
		{	
			this.tt_24.x = t_lang[chosenL][23][9];
			this.tt_24.y = t_lang[chosenL][23][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// btn
	this.bmaziar = new lib.l1b4();
	this.bmaziar.setTransform(127.8,506.7,0.818,0.762,0,0,0,-0.6,1.1);
	new cjs.ButtonHelper(this.bmaziar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bkolacik = new lib.l1b4();
	this.bkolacik.setTransform(291.1,494.1,1.334,0.62,0,0,0,-0.5,1.9);
	new cjs.ButtonHelper(this.bkolacik, 0, 1, 2, false, new lib.l1b4(), 3);

	this.btanier = new lib.l1b4();
	this.btanier.setTransform(34.5,617.4,1.636,0.803,0,0,0,-0.2,1.8);
	new cjs.ButtonHelper(this.btanier, 0, 1, 2, false, new lib.l1b4(), 3);

	this.borange = new lib.l1b4();
	this.borange.setTransform(188,419.3,0.75,1.199,0,0,0,-0.2,1.3);
	new cjs.ButtonHelper(this.borange, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bvaza = new lib.l1b4();
	this.bvaza.setTransform(34.6,325.4,0.964,2.255,0,0,0,-0.8,0.7);
	new cjs.ButtonHelper(this.bvaza, 0, 1, 2, false, new lib.l1b4(), 3);

	this.boven = new lib.l1b4();
	this.boven.setTransform(229.6,687.6,2.103,0.508,0,0,0,-0.6,1.1);
	new cjs.ButtonHelper(this.boven, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.boven},{t:this.bvaza},{t:this.borange},{t:this.btanier},{t:this.bkolacik},{t:this.bmaziar}]}).wait(1));

	// obj
	this.tanier = new lib.tanierlvl14();
	this.tanier.setTransform(86.7,648.6,1,1,0,0,0,59.9,16.9);

	this.kolacik = new lib.tanier2();
	this.kolacik.setTransform(322.8,506.1,1,1,0,0,0,48.2,19.8);

	this.maziar = new lib.drvičkalvl14();
	this.maziar.setTransform(123.1,508.9);

	this.muffin = new lib.maffinlvl14();
	this.muffin.setTransform(239.7,544.6,1,1,0,0,0,25.9,13.3);

	this.orange = new lib.siruplvl14();
	this.orange.setTransform(199.1,496,1,1,0,0,0,15.6,12.9);

	this.vaza = new lib.vázalvl13();
	this.vaza.setTransform(68.8,408,1,1,0,0,0,52.4,106.5);

	this.oven = new lib.rúra13lvl();
	this.oven.setTransform(364,796.5,1,1,0,0,0,163.7,115.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.oven},{t:this.vaza},{t:this.orange},{t:this.muffin},{t:this.maziar},{t:this.kolacik},{t:this.tanier}]}).wait(1));

	// bg
	this.tt_24 = new cjs.Text("SUGAR", "20px 'Ubuntu Light'", "#402415");
	this.tt_24.name = "tt_24";
	this.tt_24.textAlign = "center";
	this.tt_24.lineHeight = 28;
	this.tt_24.lineWidth = 98;
	this.tt_24.setTransform(292.5,631.3,1.296,1.291);

	this.instance = new lib.Bitmap5();
	this.instance.setTransform(-0.1,-0.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance},{t:this.tt_24}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-84.1,-0.2,894,735.9);


(lib.level13 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
		
		
		this.boven.on("click", funkcia104);
		this.bvaza.on("click", funkcia1001);
		this.btanier.on("click", funkcia1002);
		
		this.bmaziar.on("click", funkcia1301);
		this.borange.on("click", funkcia1302);
		this.bforma.on("click", funkcia1303);
		
		function funkcia104(evt) 
		
			
			{
				if (_this.oven.getCurrentLabel() == "startF" )
		
					{
						_this.oven.gotoAndPlay("animF");
					}
		
			}
		
			
		function funkcia1001(evt) 
		
			
			{
				if (_this.vaza.getCurrentLabel() == "startF" )
		
					{
						_this.vaza.gotoAndPlay("animF");
					}
		
			}
			
			
		function funkcia1002(evt) 
		
			
			{
				if (_this.tanier.getCurrentLabel() == "startF" )
		
					{
						_this.tanier.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia1301(evt) 
		
			
			{
				if (_this.maziar.getCurrentLabel() == "startF" )
		
					{
						_this.maziar.gotoAndPlay("animF");
					}
		
			}
			
			
		function funkcia1302(evt) 
		
			
			{
				if (_this.orange.getCurrentLabel() == "startF" && _this.maziar.timeline.position >= 92)
		
					{
						_this.orange.gotoAndPlay("animF");
					}
				
				else if (_this.orange.getCurrentLabel() == "startF" && _this.maziar.getCurrentLabel() == "startF")
		
					{
						_this.orange.gotoAndPlay("negF");
					}
			}
			
			
			
		function funkcia1303(evt) 
		
			
			{
				if (_this.forma.getCurrentLabel() == "startF" && _this.orange.timeline.position >= 100)
		
					{
						_this.forma.gotoAndPlay("animF");
					}
				
				else if (_this.forma.getCurrentLabel() == "startF" && _this.orange.getCurrentLabel() == "startF")
		
					{
						_this.forma.gotoAndPlay("negF");
					}
			}
		this.tt_24.text = t_lang[chosenL][23][0];
		this.tt_24.font = t_lang[chosenL][23][1];
		this.tt_24.color = t_lang[chosenL][23][2];
		this.tt_24.lineHeight = t_lang[chosenL][23][3];
		this.tt_24.lineWidth = t_lang[chosenL][23][4];
		this.tt_24.maxWidth = t_lang[chosenL][23][5];
		this.tt_24.textAlign = t_lang[chosenL][23][6];
		this.tt_24.textBaseline = t_lang[chosenL][23][7];
		this.tt_24.rotation = t_lang[chosenL][23][8];
		if ((t_lang[chosenL][23][9]) != null && 
			(t_lang[chosenL][23][10]) != null)
		{	
			this.tt_24.x = t_lang[chosenL][23][9];
			this.tt_24.y = t_lang[chosenL][23][10];
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// btn
	this.bforma = new lib.l1b4();
	this.bforma.setTransform(290.6,497.2,1.48,0.843,0,0,0,-0.6,0.8);
	new cjs.ButtonHelper(this.bforma, 0, 1, 2, false, new lib.l1b4(), 3);

	this.btanier = new lib.l1b4();
	this.btanier.setTransform(30.5,617.4,1.636,0.803,0,0,0,-0.2,1.8);
	new cjs.ButtonHelper(this.btanier, 0, 1, 2, false, new lib.l1b4(), 3);

	this.borange = new lib.l1b4();
	this.borange.setTransform(214,419.3,0.75,1.199,0,0,0,-0.2,1.3);
	new cjs.ButtonHelper(this.borange, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bmaziar = new lib.l1b4();
	this.bmaziar.setTransform(20.3,506.8,0.876,0.834,0,0,0,-0.6,1.2);
	new cjs.ButtonHelper(this.bmaziar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bvaza = new lib.l1b4();
	this.bvaza.setTransform(34.6,325.2,0.964,2.114,0,0,0,-0.8,0.7);
	new cjs.ButtonHelper(this.bvaza, 0, 1, 2, false, new lib.l1b4(), 3);

	this.boven = new lib.l1b4();
	this.boven.setTransform(229.6,687.6,2.103,0.508,0,0,0,-0.6,1.1);
	new cjs.ButtonHelper(this.boven, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.boven},{t:this.bvaza},{t:this.bmaziar},{t:this.borange},{t:this.btanier},{t:this.bforma}]}).wait(1));

	// zoom
	this.instance = new lib.zoomedIII();
	this.instance.setTransform(206,403,1,1,0,0,0,196,186);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	// obj
	this.forma = new lib.maffinováformalvl13();
	this.forma.setTransform(379.7,521.6,1,1,0,0,0,132.1,42.6);

	this.orange = new lib.siruplvl13();
	this.orange.setTransform(235.3,460.3,1,1,0,0,0,41.6,59.2);

	this.maziar = new lib.drvičkalvl13();
	this.maziar.setTransform(77.3,652.5,1,1,0,0,0,64.3,46.9);

	this.tanier = new lib.tanierlvl13();
	this.tanier.setTransform(85.6,655.4,1,1,0,0,0,78,27.7);

	this.vaza = new lib.vázalvl13();
	this.vaza.setTransform(68.8,408,1,1,0,0,0,52.4,106.5);

	this.oven = new lib.rúra13lvl();
	this.oven.setTransform(364,796.5,1,1,0,0,0,163.7,115.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.oven},{t:this.vaza},{t:this.tanier},{t:this.maziar},{t:this.orange},{t:this.forma}]}).wait(1));

	// bg
	this.tt_24 = new cjs.Text("SUGAR", "20px 'Ubuntu Light'", "#402415");
	this.tt_24.name = "tt_24";
	this.tt_24.textAlign = "center";
	this.tt_24.lineHeight = 28;
	this.tt_24.lineWidth = 98;
	this.tt_24.setTransform(292.5,631.3,1.296,1.291);

	this.instance_1 = new lib.Bitmap5();
	this.instance_1.setTransform(-0.1,-0.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.tt_24}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-114.6,-126.8,730,1281.9);


(lib.level12 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
		
		
		this.boven.on("click", funkcia104);
		this.bpowder.on("click", funkcia107);
		
		this.bvaza.on("click", funkcia1001);
		this.btanier.on("click", funkcia1002);
		this.bforma.on("click", funkcia1003);
		this.bmiska.on("click", funkcia1004);
		
		this.borange.on("click", funkcia1101);
		
		
		this.bsugar.on("click", funkcia106);
		this.bmaziar.on("click", funkcia106);
		
		function funkcia104(evt) 
		
			
			{
				if (_this.oven.getCurrentLabel() == "startF" )
		
					{
						_this.oven.gotoAndPlay("animF");
					}
		
			}
		
		
		function funkcia106(evt) 
		
			
			{
				if (_this.sugar.getCurrentLabel() == "startF" )
		
					{
						_this.sugar.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia107(evt) 
		
			
			{
				if (_this.powder.getCurrentLabel() == "startF" )
		
					{
						_this.powder.gotoAndPlay("animF");
					}
		
			}
			
		
			
		function funkcia1001(evt) 
		
			
			{
				if (_this.vaza.getCurrentLabel() == "startF" )
		
					{
						_this.vaza.gotoAndPlay("animF");
					}
		
			}
			
			
		function funkcia1002(evt) 
		
			
			{
				if (_this.tanier.getCurrentLabel() == "startF" )
		
					{
						_this.tanier.gotoAndPlay("animF");
					}
		
			}
			
			
		function funkcia1003(evt) 
		
			
			{
				if (_this.forma.getCurrentLabel() == "startF" )
		
					{
						_this.forma.gotoAndPlay("animF");
					}
		
			}
		
		
			
		function funkcia1004(evt) 
		
			
			{
				if (_this.miska.getCurrentLabel() == "startF" )
		
					{
						_this.miska.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia1101(evt) 
		
			
			{
				if (_this.orange.getCurrentLabel() == "startF" )
		
					{
						_this.orange.gotoAndPlay("animF");
					}
		
			}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// btn
	this.bmiska = new lib.l1b4();
	this.bmiska.setTransform(26.5,632.5,1.353,0.732,0,0,0,-0.4,0.7);
	new cjs.ButtonHelper(this.bmiska, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bforma = new lib.l1b4();
	this.bforma.setTransform(219.2,420.5,1.48,0.732,0,0,0,-0.6,0.7);
	new cjs.ButtonHelper(this.bforma, 0, 1, 2, false, new lib.l1b4(), 3);

	this.btanier = new lib.l1b4();
	this.btanier.setTransform(26.6,502.7,1.396,0.529,0,0,0,-0.3,1.5);
	new cjs.ButtonHelper(this.btanier, 0, 1, 2, false, new lib.l1b4(), 3);

	this.borange = new lib.l1b4();
	this.borange.setTransform(153.1,382.8,0.646,0.768,0,0,0,-0.2,1.4);
	new cjs.ButtonHelper(this.borange, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bmaziar = new lib.l1b4();
	this.bmaziar.setTransform(34.9,435.3,0.646,0.528,0,0,0,-0.2,1);
	new cjs.ButtonHelper(this.bmaziar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bvaza = new lib.l1b4();
	this.bvaza.setTransform(45,318.6,0.701,1.412,0,0,0,-0.4,0.7);
	new cjs.ButtonHelper(this.bvaza, 0, 1, 2, false, new lib.l1b4(), 3);

	this.boven = new lib.l1b4();
	this.boven.setTransform(184.3,571.1,1.95,1.454,0,0,0,-0.6,0.9);
	new cjs.ButtonHelper(this.boven, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bpowder = new lib.l1b4();
	this.bpowder.setTransform(284.8,499.6,1.12,0.58,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bpowder, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsugar = new lib.l1b4();
	this.bsugar.setTransform(169.8,498.5,1.12,0.58,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bsugar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.bsugar},{t:this.bpowder},{t:this.boven},{t:this.bvaza},{t:this.bmaziar},{t:this.borange},{t:this.btanier},{t:this.bforma},{t:this.bmiska}]}).wait(1));

	// obj
	this.sugar = new lib.cukorlvl12();
	this.sugar.setTransform(209.2,520.4,1,1,0,0,0,58.6,20.8);

	this.orange = new lib.siruplvl12();
	this.orange.setTransform(145.6,420.4,1,1,0,0,0,27.7,22.2);

	this.vaza = new lib.Zoomedváza();
	this.vaza.setTransform(64.1,375.1,1,1,0,0,0,36.4,69.2);

	this.forma = new lib.Maffinovéformy();
	this.forma.setTransform(266.4,448.8,1,1,0,0,0,78.9,20.9);

	this.oven = new lib.Zoomedrúra();
	this.oven.setTransform(250,619.8,1,1,0,0,0,102.2,71.7);

	this.powder = new lib.Bakingp();
	this.powder.setTransform(322.7,520.6,1,1,0,0,0,57.2,19.6);

	this.tanier = new lib.taniersmrkvou();
	this.tanier.setTransform(78.7,526.3,1,1,0,0,0,42.4,11.6);

	this.miska = new lib.myskavelká();
	this.miska.setTransform(75,659.5,1,1,0,0,0,52.8,28.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.miska},{t:this.tanier},{t:this.powder},{t:this.oven},{t:this.forma},{t:this.vaza},{t:this.orange},{t:this.sugar}]}).wait(1));

	// bg
	this.instance = new lib.Bitmap4();
	this.instance.setTransform(-0.1,-0.2);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-0.1,-0.2,493,721);


(lib.level11 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
		
		
		
		
		
		
		
		
		
		
		this.boven.on("click", funkcia104);
		this.bsugar.on("click", funkcia106);
		this.bpowder.on("click", funkcia107);
		
		this.bvaza.on("click", funkcia1001);
		this.btanier.on("click", funkcia1002);
		this.bforma.on("click", funkcia1003);
		this.bmiska.on("click", funkcia1004);
		
		this.borange.on("click", funkcia1101);
		this.bmaziar.on("click", funkcia1102);
		
		
		function funkcia104(evt) 
		
			
			{
				if (_this.oven.getCurrentLabel() == "startF" )
		
					{
						_this.oven.gotoAndPlay("animF");
					}
		
			}
		
		
		function funkcia106(evt) 
		
			
			{
				if (_this.sugar.getCurrentLabel() == "startF" )
		
					{
						_this.sugar.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia107(evt) 
		
			
			{
				if (_this.powder.getCurrentLabel() == "startF" )
		
					{
						_this.powder.gotoAndPlay("animF");
					}
		
			}
			
		
			
		function funkcia1001(evt) 
		
			
			{
				if (_this.vaza.getCurrentLabel() == "startF" )
		
					{
						_this.vaza.gotoAndPlay("animF");
					}
		
			}
			
			
		function funkcia1002(evt) 
		
			
			{
				if (_this.tanier.getCurrentLabel() == "startF" )
		
					{
						_this.tanier.gotoAndPlay("animF");
					}
		
			}
			
			
		function funkcia1003(evt) 
		
			
			{
				if (_this.forma.getCurrentLabel() == "startF" )
		
					{
						_this.forma.gotoAndPlay("animF");
					}
		
			}
		
		
			
		function funkcia1004(evt) 
		
			
			{
				if (_this.miska.getCurrentLabel() == "startF" )
		
					{
						_this.miska.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia1101(evt) 
		
			
			{
				if (_this.orange.getCurrentLabel() == "startF" )
		
					{
						_this.orange.gotoAndPlay("animF");
					}
		
			}
			
			
			
		function funkcia1102(evt) 
		
			
			{
				if (_this.maziar.getCurrentLabel() == "startF" && _this.orange.timeline.position >= 34)
		
					{
						_this.maziar.gotoAndPlay("animF");
					}
				
				else if (_this.maziar.getCurrentLabel() == "startF" && _this.orange.getCurrentLabel() == "startF")
		
					{
						_this.maziar.gotoAndPlay("negF");
					}
			}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// btn
	this.bmiska = new lib.l1b4();
	this.bmiska.setTransform(26.5,632.5,1.353,0.732,0,0,0,-0.4,0.7);
	new cjs.ButtonHelper(this.bmiska, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bforma = new lib.l1b4();
	this.bforma.setTransform(208.8,420.5,1.714,0.732,0,0,0,-0.4,0.7);
	new cjs.ButtonHelper(this.bforma, 0, 1, 2, false, new lib.l1b4(), 3);

	this.btanier = new lib.l1b4();
	this.btanier.setTransform(26.6,502.7,1.396,0.529,0,0,0,-0.3,1.5);
	new cjs.ButtonHelper(this.btanier, 0, 1, 2, false, new lib.l1b4(), 3);

	this.borange = new lib.l1b4();
	this.borange.setTransform(21.4,556.8,0.646,0.768,0,0,0,-0.2,1.4);
	new cjs.ButtonHelper(this.borange, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bmaziar = new lib.l1b4();
	this.bmaziar.setTransform(82,567.4,0.646,0.661,0,0,0,-0.2,0.9);
	new cjs.ButtonHelper(this.bmaziar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bvaza = new lib.l1b4();
	this.bvaza.setTransform(47,319.1,0.701,1.621,0,0,0,-0.4,0.8);
	new cjs.ButtonHelper(this.bvaza, 0, 1, 2, false, new lib.l1b4(), 3);

	this.boven = new lib.l1b4();
	this.boven.setTransform(184.3,571.1,1.95,1.454,0,0,0,-0.6,0.9);
	new cjs.ButtonHelper(this.boven, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bpowder = new lib.l1b4();
	this.bpowder.setTransform(284.8,499.6,1.12,0.58,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bpowder, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsugar = new lib.l1b4();
	this.bsugar.setTransform(169.8,498.5,1.12,0.58,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bsugar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.bsugar},{t:this.bpowder},{t:this.boven},{t:this.bvaza},{t:this.bmaziar},{t:this.borange},{t:this.btanier},{t:this.bforma},{t:this.bmiska}]}).wait(1));

	// zoom
	this.zoom = new lib.zoomedscene();
	this.zoom.setTransform(204.8,482.8,1,1,0,0,0,128.1,75.5);

	this.timeline.addTween(cjs.Tween.get(this.zoom).wait(1));

	// obj
	this.orange = new lib.sirup();
	this.orange.setTransform(52.8,583.4,1,1,0,0,0,29.8,36.6);

	this.maziar = new lib.drvič();
	this.maziar.setTransform(103.5,593.2,1,1,0,0,0,23.2,17.4);

	this.vaza = new lib.Zoomedváza();
	this.vaza.setTransform(64.1,375.1,1,1,0,0,0,36.4,69.2);

	this.forma = new lib.Maffinovéformy();
	this.forma.setTransform(266.4,448.8,1,1,0,0,0,78.9,20.9);

	this.oven = new lib.Zoomedrúra();
	this.oven.setTransform(250,619.8,1,1,0,0,0,102.2,71.7);

	this.powder = new lib.Bakingp();
	this.powder.setTransform(322.7,520.6,1,1,0,0,0,57.2,19.6);

	this.sugar = new lib.sugar();
	this.sugar.setTransform(209,521.1,1,1,0,0,0,58.3,22.2);

	this.tanier = new lib.taniersmrkvou();
	this.tanier.setTransform(78.7,526.3,1,1,0,0,0,42.4,11.6);

	this.miska = new lib.myskavelká();
	this.miska.setTransform(75,659.5,1,1,0,0,0,52.8,28.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.miska},{t:this.tanier},{t:this.sugar},{t:this.powder},{t:this.oven},{t:this.forma},{t:this.vaza},{t:this.maziar},{t:this.orange}]}).wait(1));

	// bg
	this.instance = new lib.Bitmap4();
	this.instance.setTransform(-0.1,-0.2);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-102.8,-1.2,595.8,727);


(lib.level10 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
		
		this.bvaza.on("click", funkcia1001);
		this.btanier.on("click", funkcia1002);
		this.borange.on("click", funkcia1003);
		this.bmaziar.on("click", funkcia1004);
		
		this.bforma.on("click", funkcia1005);
		this.boven.on("click", funkcia1005);
		this.boven.on("click", funkcia1006);
		
		
		
		
		this.bflour.on("click", funkcia105);
		this.bsugar.on("click", funkcia106);
		this.bpowder.on("click", funkcia107);
		
		
		function funkcia105(evt) 
		
			
			{
				if (_this.flour.getCurrentLabel() == "startF" )
		
					{
						_this.flour.gotoAndPlay("animF");
					}
		
			}
		
		
		function funkcia106(evt) 
		
			
			{
				if (_this.sugar.getCurrentLabel() == "startF" )
		
					{
						_this.sugar.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia107(evt) 
		
			
			{
				if (_this.powder.getCurrentLabel() == "startF" )
		
					{
						_this.powder.gotoAndPlay("animF");
					}
		
			}
			
		
			
		function funkcia1001(evt) 
		
			
			{
				if (_this.vaza.getCurrentLabel() == "startF" )
		
					{
						_this.vaza.gotoAndPlay("animF");
					}
		
			}
			
			
		function funkcia1002(evt) 
		
			
			{
				if (_this.tanier.getCurrentLabel() == "startF" )
		
					{
						_this.tanier.gotoAndPlay("animF");
					}
		
			}
			
			
		function funkcia1003(evt) 
		
			
			{
				if (_this.orange.getCurrentLabel() == "startF" )
		
					{
						_this.orange.gotoAndPlay("animF");
					}
		
			}
		
		
			
		function funkcia1004(evt) 
		
			
			{
				if (_this.maziar.getCurrentLabel() == "startF" )
		
					{
						_this.maziar.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia1005(evt) 
		
			
			{
				if (_this.pecenie.getCurrentLabel() == "startF" )
		
					{
						_this.pecenie.gotoAndPlay("animF");
					}
		
			}
			
		
		
		function funkcia1006(evt) 
		
			
			{
				if (_this.oven.getCurrentLabel() == "startF" && _this.pecenie.timeline.position >= 170)
		
					{
						_this.oven.gotoAndPlay("animF");
					}
				
			}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// btn
	this.bforma = new lib.l1b4();
	this.bforma.setTransform(170.4,426.8,1.324,0.59,0,0,0,-0.2,0.2);
	new cjs.ButtonHelper(this.bforma, 0, 1, 2, false, new lib.l1b4(), 3);

	this.btanier = new lib.l1b4();
	this.btanier.setTransform(31.1,491.1,0.993,0.376,0,0,0,-0.1,1);
	new cjs.ButtonHelper(this.btanier, 0, 1, 2, false, new lib.l1b4(), 3);

	this.borange = new lib.l1b4();
	this.borange.setTransform(24.4,533.5,0.496,0.59,0,0,0,-0.3,1.2);
	new cjs.ButtonHelper(this.borange, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bmaziar = new lib.l1b4();
	this.bmaziar.setTransform(74,541.7,0.496,0.508,0,0,0,-0.3,0.9);
	new cjs.ButtonHelper(this.bmaziar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bvaza = new lib.l1b4();
	this.bvaza.setTransform(43.2,346.9,0.496,1.148,0,0,0,-0.3,0.9);
	new cjs.ButtonHelper(this.bvaza, 0, 1, 2, false, new lib.l1b4(), 3);

	this.boven = new lib.l1b4();
	this.boven.setTransform(152.6,544.7,1.499,1.118,0,0,0,-0.6,1);
	new cjs.ButtonHelper(this.boven, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bflour = new lib.l1b4();
	this.bflour.setTransform(319,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bflour, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bpowder = new lib.l1b4();
	this.bpowder.setTransform(231,488.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bpowder, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsugar = new lib.l1b4();
	this.bsugar.setTransform(142,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bsugar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.bsugar},{t:this.bpowder},{t:this.bflour},{t:this.boven},{t:this.bvaza},{t:this.bmaziar},{t:this.borange},{t:this.btanier},{t:this.bforma}]}).wait(1));

	// frnt
	this.rdoor = new lib.pravédvere();
	this.rdoor.setTransform(343.3,580.1,1,1,0,0,0,50.6,54.6);

	this.ldoor = new lib.ĽavédvereLVL3();
	this.ldoor.setTransform(57.8,557.8,1,1,0,0,0,56.9,81);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.ldoor},{t:this.rdoor}]}).wait(1));

	// obj
	this.vaza = new lib.Váza();
	this.vaza.setTransform(57,392.5,1,1,0,0,0,38.8,48.2);

	this.Veľkámyska = new lib.Myska();
	this.Veľkámyska.setTransform(335.5,424.3,1,1,0,0,0,50.8,26.3);

	this.tanier = new lib.struhanámrkva();
	this.tanier.setTransform(42,504.2,1,1,0,0,0,28.9,14.2);

	this.orange = new lib.orangejuice();
	this.orange.setTransform(60.1,552.4,1,1,0,0,0,14.1,25.7);

	this.maziar = new lib.olej();
	this.maziar.setTransform(29.1,551.4,1,1,0,0,0,12.7,25.8);

	this.pecenie = new lib.ruravakcií();
	this.pecenie.setTransform(203.7,580.2,1,1,0,0,0,77.8,53.6);

	this.oven = new lib.Zrúryvon();
	this.oven.setTransform(225.8,629.4,1,1,0,0,0,99.9,102.8);

	this.lyzicka = new lib.ližičkalvl8();
	this.lyzicka.setTransform(358.1,591.6,1,1,0,0,0,24.8,4.5);

	this.mlieko = new lib.mliekolvl8();
	this.mlieko.setTransform(362,567.5,1,1,0,0,0,23.4,28);

	this.olej = new lib.Olejlvl8();
	this.olej.setTransform(316.1,570.2,1,1,0,0,0,15.8,26.6);

	this.flour = new lib.Flouršuflík();
	this.flour.setTransform(303.2,487.3);

	this.powder = new lib.Bakingpšuflík();
	this.powder.setTransform(260.3,502.9,1,1,0,0,0,46.6,15.8);

	this.sugar = new lib.Sugaršuflík();
	this.sugar.setTransform(259.7,503.7,1,1,0,0,0,134.3,16.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.sugar},{t:this.powder},{t:this.flour},{t:this.olej},{t:this.mlieko},{t:this.lyzicka},{t:this.oven},{t:this.pecenie},{t:this.maziar},{t:this.orange},{t:this.tanier},{t:this.Veľkámyska},{t:this.vaza}]}).wait(1));

	// bg
	this.instance = new lib.BACKGROUND();
	this.instance.setTransform(202.5,360,1,1,0,0,0,202.5,360);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-80.5,-0.2,565,722);


(lib.level9 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
		
		this.bvarecha.on("click", funkcia901);
		this.bmiska.on("click", funkcia901);
		
		this.bforma.on("click", funkcia703);
		this.bolej.on("click", funkcia803);
		this.bmlieko.on("click", funkcia804);
		
		
		this.blyzicka.on("click", funkcia401);
		this.bsol.on("click", funkcia402);
		this.bldoor.on("click", funkcia101);
		this.boven.on("click", funkcia104);
		this.bflour.on("click", funkcia105);
		this.bsugar.on("click", funkcia106);
		this.bpowder.on("click", funkcia107);
		
		
		
		function funkcia101(evt) 
		
			{
				if (_this.ldoor.getCurrentLabel() == "startF" )
		
					{
						_this.ldoor.gotoAndPlay("animF");
					}
		
			}
		
		
			
		function funkcia104(evt) 
		
			
			{
				if (_this.oven.getCurrentLabel() == "startF" )
		
					{
						_this.oven.gotoAndPlay("animF");
					}
		
			}
		
		
		function funkcia105(evt) 
		
			
			{
				if (_this.flour.getCurrentLabel() == "startF" )
		
					{
						_this.flour.gotoAndPlay("animF");
					}
		
			}
		
		
		function funkcia106(evt) 
		
			
			{
				if (_this.sugar.getCurrentLabel() == "startF" )
		
					{
						_this.sugar.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia107(evt) 
		
			
			{
				if (_this.powder.getCurrentLabel() == "startF" )
		
					{
						_this.powder.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia401(evt) 
		
			
			{
				if (_this.lyzicka.getCurrentLabel() == "startF" )
		
					{
						_this.lyzicka.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia402(evt) 
		
			
			{
				if (_this.sol.getCurrentLabel() == "startF" )
		
					{
						_this.sol.gotoAndPlay("animF");
					}
		
			}
			
			
		function funkcia703(evt) 
		
			
			{
				if (_this.forma.getCurrentLabel() == "startF" )
		
					{
						_this.forma.gotoAndPlay("animF");
					}
		
			}
			
			
			
		function funkcia803(evt) 
		
			{
				if (_this.olej.getCurrentLabel() == "startF" )
		
					{
						_this.olej.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia804(evt) 
		
			{
				if (_this.mlieko.getCurrentLabel() == "startF" )
		
					{
						_this.mlieko.gotoAndPlay("animF");
					}
		
			}
			
			
		function funkcia901(evt) 
		
			
			{
				if (_this.stierka.getCurrentLabel() == "startF" && _this.forma.timeline.position >= 33)
		
					{
						_this.stierka.gotoAndPlay("animF");
					}
				
				else if (_this.stierka.getCurrentLabel() == "startF" && _this.forma.getCurrentLabel() == "startF")
		
					{
						_this.stierka.gotoAndPlay("negF");
					}
			}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// btn
	this.bvarecha = new lib.l1b4();
	this.bvarecha.setTransform(43.2,346.9,0.496,1.148,0,0,0,-0.3,0.9);
	new cjs.ButtonHelper(this.bvarecha, 0, 1, 2, false, new lib.l1b4(), 3);

	this.blyzicka = new lib.l1b4();
	this.blyzicka.setTransform(337.4,588.2,0.633,0.184,0,0,0,-0.1,-0.2);
	new cjs.ButtonHelper(this.blyzicka, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bmlieko = new lib.l1b4();
	this.bmlieko.setTransform(341.9,537,0.506,0.793,0,0,0,-1.2,1);
	new cjs.ButtonHelper(this.bmlieko, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bolej = new lib.l1b4();
	this.bolej.setTransform(296.3,537.8,0.408,0.793,0,0,0,-0.8,1);
	new cjs.ButtonHelper(this.bolej, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bforma = new lib.l1b4();
	this.bforma.setTransform(307.6,608.7,0.993,0.376,0,0,0,-0.2,-0.7);
	new cjs.ButtonHelper(this.bforma, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bldoor = new lib.l1b4();
	this.bldoor.setTransform(20.2,503.5,1.168,1.708,0,0,0,-0.7,0.9);
	new cjs.ButtonHelper(this.bldoor, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bmiska = new lib.l1b4();
	this.bmiska.setTransform(295.9,405.8,0.866,0.61,0,0,0,-0.2,0);
	new cjs.ButtonHelper(this.bmiska, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsol = new lib.l1b4();
	this.bsol.setTransform(96.7,411.1,0.467,0.427,0,0,0,-0.2,0);
	new cjs.ButtonHelper(this.bsol, 0, 1, 2, false, new lib.l1b4(), 3);

	this.boven = new lib.l1b4();
	this.boven.setTransform(152.6,544.7,1.499,1.118,0,0,0,-0.6,1);
	new cjs.ButtonHelper(this.boven, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bflour = new lib.l1b4();
	this.bflour.setTransform(319,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bflour, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bpowder = new lib.l1b4();
	this.bpowder.setTransform(231,488.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bpowder, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsugar = new lib.l1b4();
	this.bsugar.setTransform(142,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bsugar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.bsugar},{t:this.bpowder},{t:this.bflour},{t:this.boven},{t:this.bsol},{t:this.bmiska},{t:this.bldoor},{t:this.bforma},{t:this.bolej},{t:this.bmlieko},{t:this.blyzicka},{t:this.bvarecha}]}).wait(1));

	// frnt
	this.ldoor = new lib.Ľavédvere();
	this.ldoor.setTransform(57.1,563.9,1,1,0,0,0,57.6,77.4);

	this.timeline.addTween(cjs.Tween.get(this.ldoor).wait(1));

	// obj
	this.vaza = new lib.vázavarech();
	this.vaza.setTransform(40.1,388.3,1,1,0,0,0,21.9,44);

	this.stierka = new lib.myskalvl9();
	this.stierka.setTransform(330.6,427.2,1,1,0,0,0,45.7,24.2);

	this.forma = new lib.muffinováformalvl9();
	this.forma.setTransform(342.9,619.8,1,1,0,0,0,49.8,14.8);

	this.lyzicka = new lib.ližičkalvl8();
	this.lyzicka.setTransform(358.1,591.6,1,1,0,0,0,24.8,4.5);

	this.mlieko = new lib.mliekolvl8();
	this.mlieko.setTransform(362,567.5,1,1,0,0,0,23.4,28);

	this.olej = new lib.Olejlvl8();
	this.olej.setTransform(316.1,570.2,1,1,0,0,0,15.8,26.6);

	this.flour = new lib.Flouršuflík();
	this.flour.setTransform(303.2,487.3);

	this.powder = new lib.Bakingpšuflík();
	this.powder.setTransform(260.3,502.9,1,1,0,0,0,46.6,15.8);

	this.sugar = new lib.Sugaršuflík();
	this.sugar.setTransform(259.7,503.7,1,1,0,0,0,134.3,16.2);

	this.oven = new lib.Rúra();
	this.oven.setTransform(203.1,580.6,1,1,0,0,0,77.9,54);

	this.sol = new lib.soľlvl4();
	this.sol.setTransform(111.5,433.1,1,1,0,0,0,16.2,7);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.sol},{t:this.oven},{t:this.sugar},{t:this.powder},{t:this.flour},{t:this.olej},{t:this.mlieko},{t:this.lyzicka},{t:this.forma},{t:this.stierka},{t:this.vaza}]}).wait(1));

	// bg
	this.instance = new lib.BACKGROUND();
	this.instance.setTransform(202.5,360,1,1,0,0,0,202.5,360);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-80.5,-0.2,565,722);


(lib.level8 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
		
		
		this.bvarecha.on("click", funkcia801);
		this.bmiska.on("click", funkcia802);
		this.bolej.on("click", funkcia803);
		this.bmlieko.on("click", funkcia804);
		
		this.bforma.on("click", funkcia703);
		
		
		this.blyzicka.on("click", funkcia401);
		this.bsol.on("click", funkcia402);
		this.bldoor.on("click", funkcia101);
		this.boven.on("click", funkcia104);
		this.bflour.on("click", funkcia105);
		this.bsugar.on("click", funkcia106);
		this.bpowder.on("click", funkcia107);
		
		
		
		function funkcia101(evt) 
		
			{
				if (_this.ldoor.getCurrentLabel() == "startF" )
		
					{
						_this.ldoor.gotoAndPlay("animF");
					}
		
			}
		
		
			
		function funkcia104(evt) 
		
			
			{
				if (_this.oven.getCurrentLabel() == "startF" )
		
					{
						_this.oven.gotoAndPlay("animF");
					}
		
			}
		
		
		function funkcia105(evt) 
		
			
			{
				if (_this.flour.getCurrentLabel() == "startF" )
		
					{
						_this.flour.gotoAndPlay("animF");
					}
		
			}
		
		
		function funkcia106(evt) 
		
			
			{
				if (_this.sugar.getCurrentLabel() == "startF" )
		
					{
						_this.sugar.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia107(evt) 
		
			
			{
				if (_this.powder.getCurrentLabel() == "startF" )
		
					{
						_this.powder.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia401(evt) 
		
			
			{
				if (_this.lyzicka.getCurrentLabel() == "startF" )
		
					{
						_this.lyzicka.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia402(evt) 
		
			
			{
				if (_this.sol.getCurrentLabel() == "startF" )
		
					{
						_this.sol.gotoAndPlay("animF");
					}
		
			}
			
			
		function funkcia703(evt) 
		
			
			{
				if (_this.forma.getCurrentLabel() == "startF" )
		
					{
						_this.forma.gotoAndPlay("animF");
					}
		
			}
			
			
		function funkcia801(evt) 
		
			{
				if (_this.miesanie.getCurrentLabel() == "startF" )
		
					{
						_this.miesanie.gotoAndPlay("animF");
					}
		
			}
			
			
		function funkcia802(evt) 
		
			{
				if (_this.miesanie.getCurrentLabel() == "startF" )
		
					{
						_this.miesanie.gotoAndPlay("negF");
					}
		
			}
			
			
		function funkcia803(evt) 
		
			{
				if (_this.olej.getCurrentLabel() == "startF" )
		
					{
						_this.olej.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia804(evt) 
		
			{
				if (_this.mlieko.getCurrentLabel() == "startF" )
		
					{
						_this.mlieko.gotoAndPlay("animF");
					}
		
			}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// btn
	this.bvarecha = new lib.l1b4();
	this.bvarecha.setTransform(43.2,346.9,0.496,1.148,0,0,0,-0.3,0.9);
	new cjs.ButtonHelper(this.bvarecha, 0, 1, 2, false, new lib.l1b4(), 3);

	this.blyzicka = new lib.l1b4();
	this.blyzicka.setTransform(337.4,588.2,0.633,0.184,0,0,0,-0.1,-0.2);
	new cjs.ButtonHelper(this.blyzicka, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bmlieko = new lib.l1b4();
	this.bmlieko.setTransform(341.9,537,0.506,0.793,0,0,0,-1.2,1);
	new cjs.ButtonHelper(this.bmlieko, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bolej = new lib.l1b4();
	this.bolej.setTransform(296.3,537.8,0.408,0.793,0,0,0,-0.8,1);
	new cjs.ButtonHelper(this.bolej, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bforma = new lib.l1b4();
	this.bforma.setTransform(307.6,608.7,0.993,0.376,0,0,0,-0.2,-0.7);
	new cjs.ButtonHelper(this.bforma, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bldoor = new lib.l1b4();
	this.bldoor.setTransform(20.2,503.5,1.168,1.708,0,0,0,-0.7,0.9);
	new cjs.ButtonHelper(this.bldoor, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bmiska = new lib.l1b4();
	this.bmiska.setTransform(169,416.8,0.866,0.61,0,0,0,-0.2,0);
	new cjs.ButtonHelper(this.bmiska, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsol = new lib.l1b4();
	this.bsol.setTransform(96.7,411.1,0.467,0.427,0,0,0,-0.2,0);
	new cjs.ButtonHelper(this.bsol, 0, 1, 2, false, new lib.l1b4(), 3);

	this.boven = new lib.l1b4();
	this.boven.setTransform(152.6,544.7,1.499,1.118,0,0,0,-0.6,1);
	new cjs.ButtonHelper(this.boven, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bflour = new lib.l1b4();
	this.bflour.setTransform(319,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bflour, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bpowder = new lib.l1b4();
	this.bpowder.setTransform(231,488.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bpowder, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsugar = new lib.l1b4();
	this.bsugar.setTransform(142,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bsugar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.bsugar},{t:this.bpowder},{t:this.bflour},{t:this.boven},{t:this.bsol},{t:this.bmiska},{t:this.bldoor},{t:this.bforma},{t:this.bolej},{t:this.bmlieko},{t:this.blyzicka},{t:this.bvarecha}]}).wait(1));

	// frnt
	this.ldoor = new lib.Ľavédvere();
	this.ldoor.setTransform(57.1,563.9,1,1,0,0,0,57.6,77.4);

	this.timeline.addTween(cjs.Tween.get(this.ldoor).wait(1));

	// obj
	this.instance = new lib.varechaváza();
	this.instance.setTransform(60.1,387.4,1,1,0,0,0,26.2,40.5);

	this.miesanie = new lib.miešanievarechou();
	this.miesanie.setTransform(216.2,466.6,1,1,0,0,0,64.3,52.1);

	this.lyzicka = new lib.ližičkalvl8();
	this.lyzicka.setTransform(358.1,591.6,1,1,0,0,0,24.8,4.5);

	this.mlieko = new lib.mliekolvl8();
	this.mlieko.setTransform(362,567.5,1,1,0,0,0,23.4,28);

	this.olej = new lib.Olejlvl8();
	this.olej.setTransform(316.1,570.2,1,1,0,0,0,15.8,26.6);

	this.forma = new lib.Muffinováforma();
	this.forma.setTransform(296.6,611.1);

	this.flour = new lib.Flouršuflík();
	this.flour.setTransform(303.2,487.3);

	this.powder = new lib.Bakingpšuflík();
	this.powder.setTransform(260.3,502.9,1,1,0,0,0,46.6,15.8);

	this.sugar = new lib.Sugaršuflík();
	this.sugar.setTransform(259.7,503.7,1,1,0,0,0,134.3,16.2);

	this.oven = new lib.Rúra();
	this.oven.setTransform(203.1,580.6,1,1,0,0,0,77.9,54);

	this.sol = new lib.soľlvl4();
	this.sol.setTransform(111.5,433.1,1,1,0,0,0,16.2,7);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.sol},{t:this.oven},{t:this.sugar},{t:this.powder},{t:this.flour},{t:this.forma},{t:this.olej},{t:this.mlieko},{t:this.lyzicka},{t:this.miesanie},{t:this.instance}]}).wait(1));

	// bg
	this.instance_1 = new lib.BACKGROUND();
	this.instance_1.setTransform(202.5,360,1,1,0,0,0,202.5,360);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-80.5,-0.2,565,722);


(lib.level7 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
		
		
		this.bolej.on("click", funkcia701);
		this.bmlieko.on("click", funkcia702);
		this.bforma.on("click", funkcia703);
		
		this.blyzicka.on("click", funkcia401);
		
		
		this.bsol.on("click", funkcia401);
		this.bmiska.on("click", funkcia403);
		this.bldoor.on("click", funkcia101);
		this.bvaza.on("click", funkcia103);
		this.boven.on("click", funkcia104);
		this.bflour.on("click", funkcia105);
		this.bsugar.on("click", funkcia106);
		this.bpowder.on("click", funkcia107);
		
		
		
		function funkcia101(evt) 
		
			{
				if (_this.ldoor.getCurrentLabel() == "startF" )
		
					{
						_this.ldoor.gotoAndPlay("animF");
					}
		
			}
		
			
		function funkcia103(evt) 
		
			
			{
				if (_this.vaza.getCurrentLabel() == "startF" )
		
					{
						_this.vaza.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia104(evt) 
		
			
			{
				if (_this.oven.getCurrentLabel() == "startF" )
		
					{
						_this.oven.gotoAndPlay("animF");
					}
		
			}
		
		
		function funkcia105(evt) 
		
			
			{
				if (_this.flour.getCurrentLabel() == "startF" )
		
					{
						_this.flour.gotoAndPlay("animF");
					}
		
			}
		
		
		function funkcia106(evt) 
		
			
			{
				if (_this.sugar.getCurrentLabel() == "startF" )
		
					{
						_this.sugar.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia107(evt) 
		
			
			{
				if (_this.powder.getCurrentLabel() == "startF" )
		
					{
						_this.powder.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia401(evt) 
		
			
			{
				if (_this.lyzicka.getCurrentLabel() == "startF" )
		
					{
						_this.lyzicka.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia402(evt) 
		
			
			{
				if (_this.sol.getCurrentLabel() == "startF" )
		
					{
						_this.sol.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia403(evt) 
		
			
			{
				if (_this.miska.getCurrentLabel() == "startF" )
		
					{
						_this.miska.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia701(evt) 
		
			
			{
				if (_this.olej.getCurrentLabel() == "startF" && _this.lyzicka.timeline.position >= 74)
		
					{
						_this.olej.gotoAndPlay("animF");
					}
				
				else if (_this.olej.getCurrentLabel() == "startF" && _this.lyzicka.getCurrentLabel() == "startF")
		
					{
						_this.olej.gotoAndPlay("negF");
					}
			}
			
		
		function funkcia702(evt) 
		
			
			{
				if (_this.mlieko.getCurrentLabel() == "startF" && _this.olej.timeline.position >= 77)
		
					{
						_this.mlieko.gotoAndPlay("animF");
					}
				
				else if (_this.mlieko.getCurrentLabel() == "startF" && _this.olej.getCurrentLabel() == "startF")
		
					{
						_this.mlieko.gotoAndPlay("negF");
					}
			}
			
			
		function funkcia703(evt) 
		
			
			{
				if (_this.forma.getCurrentLabel() == "startF" )
		
					{
						_this.forma.gotoAndPlay("animF");
					}
		
			}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// btn
	this.bmlieko = new lib.l1b4();
	this.bmlieko.setTransform(341.9,537,0.506,0.793,0,0,0,-1.2,1);
	new cjs.ButtonHelper(this.bmlieko, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bolej = new lib.l1b4();
	this.bolej.setTransform(296.3,537.8,0.408,0.793,0,0,0,-0.8,1);
	new cjs.ButtonHelper(this.bolej, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bforma = new lib.l1b4();
	this.bforma.setTransform(307.6,608.7,0.993,0.376,0,0,0,-0.2,-0.7);
	new cjs.ButtonHelper(this.bforma, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bldoor = new lib.l1b4();
	this.bldoor.setTransform(20.2,503.5,1.168,1.708,0,0,0,-0.7,0.9);
	new cjs.ButtonHelper(this.bldoor, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bmiska = new lib.l1b4();
	this.bmiska.setTransform(169,416.8,0.866,0.61,0,0,0,-0.2,0);
	new cjs.ButtonHelper(this.bmiska, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsol = new lib.l1b4();
	this.bsol.setTransform(96.7,411.1,0.467,0.427,0,0,0,-0.2,0);
	new cjs.ButtonHelper(this.bsol, 0, 1, 2, false, new lib.l1b4(), 3);

	this.blyzicka = new lib.l1b4();
	this.blyzicka.setTransform(100.4,448.1,0.672,0.358,0,0,0,-0.1,0.4);
	new cjs.ButtonHelper(this.blyzicka, 0, 1, 2, false, new lib.l1b4(), 3);

	this.boven = new lib.l1b4();
	this.boven.setTransform(152.6,544.7,1.499,1.118,0,0,0,-0.6,1);
	new cjs.ButtonHelper(this.boven, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bvaza = new lib.l1b4();
	this.bvaza.setTransform(43.2,346.9,0.496,1.148,0,0,0,-0.3,0.9);
	new cjs.ButtonHelper(this.bvaza, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bflour = new lib.l1b4();
	this.bflour.setTransform(319,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bflour, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bpowder = new lib.l1b4();
	this.bpowder.setTransform(231,488.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bpowder, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsugar = new lib.l1b4();
	this.bsugar.setTransform(142,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bsugar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.bsugar},{t:this.bpowder},{t:this.bflour},{t:this.bvaza},{t:this.boven},{t:this.blyzicka},{t:this.bsol},{t:this.bmiska},{t:this.bldoor},{t:this.bforma},{t:this.bolej},{t:this.bmlieko}]}).wait(1));

	// frnt
	this.rdoor = new lib.Pravédvere();
	this.rdoor.setTransform(343.1,579.6,1,1,0,0,0,50.6,54.6);

	this.ldoor = new lib.Ľavédvere();
	this.ldoor.setTransform(57.1,563.9,1,1,0,0,0,57.6,77.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.ldoor},{t:this.rdoor}]}).wait(1));

	// obj
	this.lyzicka = new lib.ližičkalvl7();
	this.lyzicka.setTransform(116.7,452.3,1,1,0,0,0,21.4,7.9);

	this.olej = new lib.Olejlvl7();
	this.olej.setTransform(312.8,564,1,1,0,0,0,14.9,30.3);

	this.mlieko = new lib.Mlieko();
	this.mlieko.setTransform(364.6,561.3,1,1,0,0,0,23.1,33.1);

	this.forma = new lib.Muffinováforma();
	this.forma.setTransform(296.6,611.1);

	this.flour = new lib.Flouršuflík();
	this.flour.setTransform(303.2,487.3);

	this.powder = new lib.Bakingpšuflík();
	this.powder.setTransform(260.3,502.9,1,1,0,0,0,46.6,15.8);

	this.sugar = new lib.Sugaršuflík();
	this.sugar.setTransform(259.7,503.7,1,1,0,0,0,134.3,16.2);

	this.miska = new lib.Veľkámyska();
	this.miska.setTransform(202.6,439.8,1,1,0,0,0,44,20.7);

	this.oven = new lib.Rúra();
	this.oven.setTransform(203.1,580.6,1,1,0,0,0,77.9,54);

	this.vaza = new lib.Váza();
	this.vaza.setTransform(57,392.5,1,1,0,0,0,38.8,48.2);

	this.sol = new lib.soľlvl4();
	this.sol.setTransform(111.5,433.1,1,1,0,0,0,16.2,7);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.sol},{t:this.vaza},{t:this.oven},{t:this.miska},{t:this.sugar},{t:this.powder},{t:this.flour},{t:this.forma},{t:this.mlieko},{t:this.olej},{t:this.lyzicka}]}).wait(1));

	// bg
	this.instance = new lib.BACKGROUND();
	this.instance.setTransform(202.5,360,1,1,0,0,0,202.5,360);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-80.5,-4.3,565,726.1);


(lib.level6 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
		
		
		
		this.blyzicka.on("click", funkcia401);
		this.bflour.on("click", funkcia401);
		
		this.bsol.on("click", funkcia402);
		this.bmiska.on("click", funkcia403);
		this.bldoor.on("click", funkcia101);
		this.brdoor.on("click", funkcia102);
		this.bvaza.on("click", funkcia103);
		this.boven.on("click", funkcia104);
		this.bsugar.on("click", funkcia106);
		this.bpowder.on("click", funkcia107);
		
		
		
		function funkcia101(evt) 
		
			{
				if (_this.ldoor.getCurrentLabel() == "startF" )
		
					{
						_this.ldoor.gotoAndPlay("animF");
					}
		
			}
		
		function funkcia102(evt) 
		
			{
				if (_this.rdoor.getCurrentLabel() == "startF" )
		
					{
						_this.rdoor.gotoAndPlay("animF");
					}
		
			}
		
			
		function funkcia103(evt) 
		
			
			{
				if (_this.vaza.getCurrentLabel() == "startF" )
		
					{
						_this.vaza.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia104(evt) 
		
			
			{
				if (_this.oven.getCurrentLabel() == "startF" )
		
					{
						_this.oven.gotoAndPlay("animF");
					}
		
			}
		
			
		function funkcia106(evt) 
		
			
			{
				if (_this.sugar.getCurrentLabel() == "startF" )
		
					{
						_this.sugar.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia107(evt) 
		
			
			{
				if (_this.powder.getCurrentLabel() == "startF" )
		
					{
						_this.powder.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia401(evt) 
		
			
			{
				if (_this.lyzicka.getCurrentLabel() == "startF" )
		
					{
						_this.lyzicka.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia402(evt) 
		
			
			{
				if (_this.sol.getCurrentLabel() == "startF" )
		
					{
						_this.sol.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia403(evt) 
		
			
			{
				if (_this.miska.getCurrentLabel() == "startF" )
		
					{
						_this.miska.gotoAndPlay("animF");
					}
		
			}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// btn
	this.bldoor = new lib.l1b4();
	this.bldoor.setTransform(20.2,503.5,1.168,1.708,0,0,0,-0.7,0.9);
	new cjs.ButtonHelper(this.bldoor, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bmiska = new lib.l1b4();
	this.bmiska.setTransform(169,416.8,0.866,0.61,0,0,0,-0.2,0);
	new cjs.ButtonHelper(this.bmiska, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsol = new lib.l1b4();
	this.bsol.setTransform(96.7,411.1,0.467,0.427,0,0,0,-0.2,0);
	new cjs.ButtonHelper(this.bsol, 0, 1, 2, false, new lib.l1b4(), 3);

	this.blyzicka = new lib.l1b4();
	this.blyzicka.setTransform(100.4,448.1,0.672,0.358,0,0,0,-0.1,0.4);
	new cjs.ButtonHelper(this.blyzicka, 0, 1, 2, false, new lib.l1b4(), 3);

	this.brdoor = new lib.l1b4();
	this.brdoor.setTransform(306.4,539.2,1.149,1.199,0,0,0,-0.7,0.6);
	new cjs.ButtonHelper(this.brdoor, 0, 1, 2, false, new lib.l1b4(), 3);

	this.boven = new lib.l1b4();
	this.boven.setTransform(152.6,544.7,1.499,1.118,0,0,0,-0.6,1);
	new cjs.ButtonHelper(this.boven, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bvaza = new lib.l1b4();
	this.bvaza.setTransform(43.2,346.9,0.496,1.148,0,0,0,-0.3,0.9);
	new cjs.ButtonHelper(this.bvaza, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bflour = new lib.l1b4();
	this.bflour.setTransform(319,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bflour, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bpowder = new lib.l1b4();
	this.bpowder.setTransform(231,488.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bpowder, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsugar = new lib.l1b4();
	this.bsugar.setTransform(142,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bsugar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.bsugar},{t:this.bpowder},{t:this.bflour},{t:this.bvaza},{t:this.boven},{t:this.brdoor},{t:this.blyzicka},{t:this.bsol},{t:this.bmiska},{t:this.bldoor}]}).wait(1));

	// frnt
	this.ldoor = new lib.Ľavédvere();
	this.ldoor.setTransform(57.1,563.9,1,1,0,0,0,57.6,77.4);

	this.rdoor = new lib.PravédvereLVL3();
	this.rdoor.setTransform(347.3,579.1,1,1,0,0,0,58,57.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.rdoor},{t:this.ldoor}]}).wait(1));

	// obj
	this.lyzicka = new lib.Flouršuflíklvl6();
	this.lyzicka.setTransform(348.2,503.3,1,1,0,0,0,44.5,16.1);

	this.powder = new lib.Bakingpšuflík();
	this.powder.setTransform(260.3,502.9,1,1,0,0,0,46.6,15.8);

	this.sugar = new lib.Sugaršuflík();
	this.sugar.setTransform(259.7,503.7,1,1,0,0,0,134.3,16.2);

	this.sol = new lib.soľlvl4();
	this.sol.setTransform(111.5,433.1,1,1,0,0,0,16.2,7);

	this.miska = new lib.Veľkámyska();
	this.miska.setTransform(202.6,439.8,1,1,0,0,0,44,20.7);

	this.oven = new lib.Rúra();
	this.oven.setTransform(203.1,580.6,1,1,0,0,0,77.9,54);

	this.vaza = new lib.Váza();
	this.vaza.setTransform(57,392.5,1,1,0,0,0,38.8,48.2);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.vaza},{t:this.oven},{t:this.miska},{t:this.sol},{t:this.sugar},{t:this.powder},{t:this.lyzicka}]}).wait(1));

	// bg
	this.instance = new lib.BACKGROUND();
	this.instance.setTransform(202.5,360,1,1,0,0,0,202.5,360);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-80.5,-0.2,565,722);


(lib.level5 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
		
		
		
		this.blyzicka.on("click", funkcia401);
		this.bpowder.on("click", funkcia401);
		
		this.bsol.on("click", funkcia402);
		this.bmiska.on("click", funkcia403);
		this.brdoor.on("click", funkcia102);
		this.bvaza.on("click", funkcia103);
		this.boven.on("click", funkcia104);
		this.bsugar.on("click", funkcia106);
		this.bflour.on("click", funkcia107);
		
		
		
		function funkcia102(evt) 
		
			{
				if (_this.rdoor.getCurrentLabel() == "startF" )
		
					{
						_this.rdoor.gotoAndPlay("animF");
					}
		
			}
		
			
		function funkcia103(evt) 
		
			
			{
				if (_this.vaza.getCurrentLabel() == "startF" )
		
					{
						_this.vaza.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia104(evt) 
		
			
			{
				if (_this.oven.getCurrentLabel() == "startF" )
		
					{
						_this.oven.gotoAndPlay("animF");
					}
		
			}
		
			
		function funkcia106(evt) 
		
			
			{
				if (_this.sugar.getCurrentLabel() == "startF" )
		
					{
						_this.sugar.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia107(evt) 
		
			
			{
				if (_this.flour.getCurrentLabel() == "startF" )
		
					{
						_this.flour.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia401(evt) 
		
			
			{
				if (_this.lyzicka.getCurrentLabel() == "startF" )
		
					{
						_this.lyzicka.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia402(evt) 
		
			
			{
				if (_this.sol.getCurrentLabel() == "startF" )
		
					{
						_this.sol.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia403(evt) 
		
			
			{
				if (_this.miska.getCurrentLabel() == "startF" )
		
					{
						_this.miska.gotoAndPlay("animF");
					}
		
			}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// btn
	this.bmiska = new lib.l1b4();
	this.bmiska.setTransform(169,416.8,0.866,0.61,0,0,0,-0.2,0);
	new cjs.ButtonHelper(this.bmiska, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsol = new lib.l1b4();
	this.bsol.setTransform(96.7,411.1,0.467,0.427,0,0,0,-0.2,0);
	new cjs.ButtonHelper(this.bsol, 0, 1, 2, false, new lib.l1b4(), 3);

	this.blyzicka = new lib.l1b4();
	this.blyzicka.setTransform(100.4,448.1,0.672,0.358,0,0,0,-0.1,0.4);
	new cjs.ButtonHelper(this.blyzicka, 0, 1, 2, false, new lib.l1b4(), 3);

	this.brdoor = new lib.l1b4();
	this.brdoor.setTransform(306.4,539.2,1.149,1.199,0,0,0,-0.7,0.6);
	new cjs.ButtonHelper(this.brdoor, 0, 1, 2, false, new lib.l1b4(), 3);

	this.boven = new lib.l1b4();
	this.boven.setTransform(152.6,544.7,1.499,1.118,0,0,0,-0.6,1);
	new cjs.ButtonHelper(this.boven, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bvaza = new lib.l1b4();
	this.bvaza.setTransform(43.2,346.9,0.496,1.148,0,0,0,-0.3,0.9);
	new cjs.ButtonHelper(this.bvaza, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bflour = new lib.l1b4();
	this.bflour.setTransform(319,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bflour, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bpowder = new lib.l1b4();
	this.bpowder.setTransform(231,488.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bpowder, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsugar = new lib.l1b4();
	this.bsugar.setTransform(142,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bsugar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.bsugar},{t:this.bpowder},{t:this.bflour},{t:this.bvaza},{t:this.boven},{t:this.brdoor},{t:this.blyzicka},{t:this.bsol},{t:this.bmiska}]}).wait(1));

	// frnt
	this.ldoor = new lib.Ľavédverelvl5();
	this.ldoor.setTransform(57.8,558.5,1,1,0,0,0,57.8,77.2);

	this.rdoor = new lib.PravédvereLVL3();
	this.rdoor.setTransform(347.3,579.1,1,1,0,0,0,58,57.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.rdoor},{t:this.ldoor}]}).wait(1));

	// obj
	this.lyzicka = new lib.Bakingpšuflíklvl5();
	this.lyzicka.setTransform(215,486.9);

	this.sugar = new lib.Sugaršuflík();
	this.sugar.setTransform(259.7,503.7,1,1,0,0,0,134.3,16.2);

	this.sol = new lib.soľlvl4();
	this.sol.setTransform(111.5,433.1,1,1,0,0,0,16.2,7);

	this.tanier = new lib.Tanier();
	this.tanier.setTransform(65.7,618.8,1,1,0,0,0,37.3,13.4);

	this.miska = new lib.Veľkámyska();
	this.miska.setTransform(202.6,439.8,1,1,0,0,0,44,20.7);

	this.oven = new lib.Rúra();
	this.oven.setTransform(203.1,580.6,1,1,0,0,0,77.9,54);

	this.vaza = new lib.Váza();
	this.vaza.setTransform(57,392.5,1,1,0,0,0,38.8,48.2);

	this.flour = new lib.Flouršuflík();
	this.flour.setTransform(303.2,487.3);

	this.maziar = new lib.olej();
	this.maziar.setTransform(29.1,551.4,1,1,0,0,0,12.7,25.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.maziar},{t:this.flour},{t:this.vaza},{t:this.oven},{t:this.miska},{t:this.tanier},{t:this.sol},{t:this.sugar},{t:this.lyzicka}]}).wait(1));

	// bg
	this.instance = new lib.BACKGROUND();
	this.instance.setTransform(202.5,360,1,1,0,0,0,202.5,360);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-80.5,-0.2,565,722);


(lib.level4 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
		
		
		
		this.blyzicka.on("click", funkcia401);
		this.bsugar.on("click", funkcia401);
		
		this.bsol.on("click", funkcia402);
		this.bmiska.on("click", funkcia403);
		this.btanier.on("click", funkcia404);
		
		this.bmaziar.on("click", funkcia301);
		this.brdoor.on("click", funkcia102);
		this.bvaza.on("click", funkcia103);
		this.boven.on("click", funkcia104);
		this.bpowder.on("click", funkcia106);
		this.bflour.on("click", funkcia107);
		
		
		
		function funkcia102(evt) 
		
			{
				if (_this.rdoor.getCurrentLabel() == "startF" )
		
					{
						_this.rdoor.gotoAndPlay("animF");
					}
		
			}
		
			
		function funkcia103(evt) 
		
			
			{
				if (_this.vaza.getCurrentLabel() == "startF" )
		
					{
						_this.vaza.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia104(evt) 
		
			
			{
				if (_this.oven.getCurrentLabel() == "startF" )
		
					{
						_this.oven.gotoAndPlay("animF");
					}
		
			}
		
			
		function funkcia106(evt) 
		
			
			{
				if (_this.powder.getCurrentLabel() == "startF" )
		
					{
						_this.powder.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia107(evt) 
		
			
			{
				if (_this.flour.getCurrentLabel() == "startF" )
		
					{
						_this.flour.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia301(evt) 
		
			
			{
				if (_this.maziar.getCurrentLabel() == "startF" )
		
					{
						_this.maziar.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia401(evt) 
		
			
			{
				if (_this.lyzicka.getCurrentLabel() == "startF" )
		
					{
						_this.lyzicka.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia402(evt) 
		
			
			{
				if (_this.sol.getCurrentLabel() == "startF" )
		
					{
						_this.sol.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia403(evt) 
		
			
			{
				if (_this.miska.getCurrentLabel() == "startF" )
		
					{
						_this.miska.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia404(evt) 
		
			
			{
				if (_this.tanier.getCurrentLabel() == "startF" )
		
					{
						_this.tanier.gotoAndPlay("animF");
					}
		
			}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// btn
	this.bmiska = new lib.l1b4();
	this.bmiska.setTransform(169,417.8,0.866,0.61,0,0,0,-0.2,0);
	new cjs.ButtonHelper(this.bmiska, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsol = new lib.l1b4();
	this.bsol.setTransform(96.7,411.1,0.467,0.427,0,0,0,-0.2,0);
	new cjs.ButtonHelper(this.bsol, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bmaziar = new lib.l1b4();
	this.bmaziar.setTransform(72.5,539.9,0.497,0.507,0,0,0,-0.5,0.7);
	new cjs.ButtonHelper(this.bmaziar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.blyzicka = new lib.l1b4();
	this.blyzicka.setTransform(46.4,495.1,0.672,0.358,0,0,0,-0.1,0.4);
	new cjs.ButtonHelper(this.blyzicka, 0, 1, 2, false, new lib.l1b4(), 3);

	this.btanier = new lib.l1b4();
	this.btanier.setTransform(30.6,592.8,0.993,0.529,0,0,0,-0.1,0.2);
	new cjs.ButtonHelper(this.btanier, 0, 1, 2, false, new lib.l1b4(), 3);

	this.brdoor = new lib.l1b4();
	this.brdoor.setTransform(306.4,539.2,1.149,1.199,0,0,0,-0.7,0.6);
	new cjs.ButtonHelper(this.brdoor, 0, 1, 2, false, new lib.l1b4(), 3);

	this.boven = new lib.l1b4();
	this.boven.setTransform(152.6,544.7,1.499,1.118,0,0,0,-0.6,1);
	new cjs.ButtonHelper(this.boven, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bvaza = new lib.l1b4();
	this.bvaza.setTransform(43.2,346.9,0.496,1.148,0,0,0,-0.3,0.9);
	new cjs.ButtonHelper(this.bvaza, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bflour = new lib.l1b4();
	this.bflour.setTransform(319,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bflour, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bpowder = new lib.l1b4();
	this.bpowder.setTransform(231,488.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bpowder, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsugar = new lib.l1b4();
	this.bsugar.setTransform(142,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bsugar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.bsugar},{t:this.bpowder},{t:this.bflour},{t:this.bvaza},{t:this.boven},{t:this.brdoor},{t:this.btanier},{t:this.blyzicka},{t:this.bmaziar},{t:this.bsol},{t:this.bmiska}]}).wait(1));

	// frnt
	this.rdoor = new lib.PravédvereLVL3();
	this.rdoor.setTransform(347.3,579.1,1,1,0,0,0,58,57.8);

	this.timeline.addTween(cjs.Tween.get(this.rdoor).wait(1));

	// obj
	this.sol = new lib.soľlvl4();
	this.sol.setTransform(111.5,433.1,1,1,0,0,0,16.2,7);

	this.tanier = new lib.Tanier();
	this.tanier.setTransform(65.7,618.8,1,1,0,0,0,37.3,13.4);

	this.lyzicka = new lib.ližičkalvl2();
	this.lyzicka.setTransform(68.7,506.6,1,1,0,0,0,26.6,6.9);

	this.miska = new lib.Veľkámyska();
	this.miska.setTransform(202.6,439.8,1,1,0,0,0,44,20.7);

	this.oven = new lib.Rúra();
	this.oven.setTransform(203.1,580.6,1,1,0,0,0,77.9,54);

	this.vaza = new lib.Váza();
	this.vaza.setTransform(57,392.5,1,1,0,0,0,38.8,48.2);

	this.powder = new lib.Bakingpšuflík();
	this.powder.setTransform(260.3,502.9,1,1,0,0,0,46.6,15.8);

	this.flour = new lib.Flouršuflík();
	this.flour.setTransform(303.2,487.3);

	this.maziar = new lib.olej();
	this.maziar.setTransform(29.1,551.4,1,1,0,0,0,12.7,25.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.maziar},{t:this.flour},{t:this.powder},{t:this.vaza},{t:this.oven},{t:this.miska},{t:this.lyzicka},{t:this.tanier},{t:this.sol}]}).wait(1));

	// bg
	this.instance = new lib.BACKGROUND();
	this.instance.setTransform(202.5,360,1,1,0,0,0,202.5,360);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-80.5,-0.2,565,722);


(lib.level3 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
		
		
		this.bmaziar.on("click", funkcia301);
		this.blyzicka.on("click", funkcia302);
		
		this.bsol.on("click", funkcia303);
		this.bmiska.on("click", funkcia304);
		this.btanier.on("click", funkcia305);
		
		this.brdoor.on("click", funkcia102);
		this.bvaza.on("click", funkcia103);
		this.boven.on("click", funkcia104);
		this.bsugar.on("click", funkcia105);
		this.bpowder.on("click", funkcia106);
		this.bflour.on("click", funkcia107);
		
		
		
		function funkcia102(evt) 
		
			{
				if (_this.rdoor.getCurrentLabel() == "startF" )
		
					{
						_this.rdoor.gotoAndPlay("animF");
					}
		
			}
		
			
		function funkcia103(evt) 
		
			
			{
				if (_this.vaza.getCurrentLabel() == "startF" )
		
					{
						_this.vaza.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia104(evt) 
		
			
			{
				if (_this.oven.getCurrentLabel() == "startF" )
		
					{
						_this.oven.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia105(evt) 
		
			
			{
				if (_this.sugar.getCurrentLabel() == "startF" )
		
					{
						_this.sugar.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia106(evt) 
		
			
			{
				if (_this.powder.getCurrentLabel() == "startF" )
		
					{
						_this.powder.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia107(evt) 
		
			
			{
				if (_this.flour.getCurrentLabel() == "startF" )
		
					{
						_this.flour.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia301(evt) 
		
			
			{
				if (_this.maziar.getCurrentLabel() == "startF" )
		
					{
						_this.maziar.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia302(evt) 
		
			
			{
				if (_this.lyzicka.getCurrentLabel() == "startF" )
		
					{
						_this.lyzicka.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia303(evt) 
		
			
			{
				if (_this.sol.getCurrentLabel() == "startF" && _this.ldoor.timeline.position >= 19)
		
					{
						_this.sol.gotoAndPlay("animF");
					}
				
				else if (_this.sol.getCurrentLabel() == "startF" && _this.ldoor.getCurrentLabel() == "startF")
		
					{
						_this.sol.gotoAndPlay("negF");
					}
			}
			
		
		function funkcia304(evt) 
		
			
			{
				if (_this.miska.getCurrentLabel() == "startF" && _this.sol.timeline.position >= 34)
		
					{
						_this.miska.gotoAndPlay("animF");
					}
				
				else if (_this.miska.getCurrentLabel() == "startF" && _this.sol.getCurrentLabel() == "startF")
		
					{
						_this.miska.gotoAndPlay("negF");
					}
			}
			
			
		function funkcia305(evt) 
		
			
			{
				if (_this.tanier.getCurrentLabel() == "startF" && _this.miska.timeline.position >= 34)
		
					{
						_this.tanier.gotoAndPlay("animF");
					}
				
				else if (_this.tanier.getCurrentLabel() == "startF" && _this.miska.getCurrentLabel() == "startF")
		
					{
						_this.tanier.gotoAndPlay("negF");
					}
			}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// btn
	this.bsol = new lib.l1b4();
	this.bsol.setTransform(40.7,547,0.467,0.427,0,0,0,-0.2,0);
	new cjs.ButtonHelper(this.bsol, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bmaziar = new lib.l1b4();
	this.bmaziar.setTransform(81,543.3,0.419,0.427);
	new cjs.ButtonHelper(this.bmaziar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.blyzicka = new lib.l1b4();
	this.blyzicka.setTransform(46.4,495.1,0.672,0.358,0,0,0,-0.1,0.4);
	new cjs.ButtonHelper(this.blyzicka, 0, 1, 2, false, new lib.l1b4(), 3);

	this.btanier = new lib.l1b4();
	this.btanier.setTransform(280.3,414.2,0.993,0.529,0,0,0,-0.1,0.2);
	new cjs.ButtonHelper(this.btanier, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bmiska = new lib.l1b4();
	this.bmiska.setTransform(30.6,592.8,0.993,0.529,0,0,0,-0.1,0.2);
	new cjs.ButtonHelper(this.bmiska, 0, 1, 2, false, new lib.l1b4(), 3);

	this.brdoor = new lib.l1b4();
	this.brdoor.setTransform(306.4,539.2,1.149,1.199,0,0,0,-0.7,0.6);
	new cjs.ButtonHelper(this.brdoor, 0, 1, 2, false, new lib.l1b4(), 3);

	this.boven = new lib.l1b4();
	this.boven.setTransform(152.6,544.7,1.499,1.118,0,0,0,-0.6,1);
	new cjs.ButtonHelper(this.boven, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bvaza = new lib.l1b4();
	this.bvaza.setTransform(43.2,346.9,0.496,1.148,0,0,0,-0.3,0.9);
	new cjs.ButtonHelper(this.bvaza, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bflour = new lib.l1b4();
	this.bflour.setTransform(319,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bflour, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bpowder = new lib.l1b4();
	this.bpowder.setTransform(231,488.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bpowder, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsugar = new lib.l1b4();
	this.bsugar.setTransform(142,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bsugar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.bsugar},{t:this.bpowder},{t:this.bflour},{t:this.bvaza},{t:this.boven},{t:this.brdoor},{t:this.bmiska},{t:this.btanier},{t:this.blyzicka},{t:this.bmaziar},{t:this.bsol}]}).wait(1));

	// frnt
	this.rdoor = new lib.PravédvereLVL3();
	this.rdoor.setTransform(347.3,579.1,1,1,0,0,0,58,57.8);

	this.ldoor = new lib.ĽavédvereLVL3();
	this.ldoor.setTransform(0.9,476.8);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.ldoor},{t:this.rdoor}]}).wait(1));

	// obj
	this.tanier = new lib.tanierstruhanámrkva();
	this.tanier.setTransform(325,429.9,1,1,0,0,0,49.7,12.5);

	this.miska = new lib.veľkámysa();
	this.miska.setTransform(63,609.5,1,1,0,0,0,50.4,24.6);

	this.sol = new lib.soľ();
	this.sol.setTransform(81.5,561.9,1,1,0,0,0,29.5,13.3);

	this.oven = new lib.Rúra();
	this.oven.setTransform(203.1,580.6,1,1,0,0,0,77.9,54);

	this.vaza = new lib.Váza();
	this.vaza.setTransform(57,392.5,1,1,0,0,0,38.8,48.2);

	this.sugar = new lib.Sugaršuflík();
	this.sugar.setTransform(259.7,503.7,1,1,0,0,0,134.3,16.2);

	this.powder = new lib.Bakingpšuflík();
	this.powder.setTransform(260.3,502.9,1,1,0,0,0,46.6,15.8);

	this.flour = new lib.Flouršuflík();
	this.flour.setTransform(303.2,487.3);

	this.maziar = new lib.olej();
	this.maziar.setTransform(29.1,551.4,1,1,0,0,0,12.7,25.8);

	this.lyzicka = new lib.ližička();
	this.lyzicka.setTransform(69.2,506.2,1,1,0,0,0,26.1,6.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.lyzicka},{t:this.maziar},{t:this.flour},{t:this.powder},{t:this.sugar},{t:this.vaza},{t:this.oven},{t:this.sol},{t:this.miska},{t:this.tanier}]}).wait(1));

	// bg
	this.instance = new lib.BACKGROUND();
	this.instance.setTransform(202.5,360,1,1,0,0,0,202.5,360);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-80.5,-0.2,565,722);


(lib.level2 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
		
		this.bstruhanie.on("click", funkcia201);
		this.bldoor.on("click", funkcia102);
		this.bvaza.on("click", funkcia103);
		this.boven.on("click", funkcia104);
		this.bsugar.on("click", funkcia105);
		this.bpowder.on("click", funkcia106);
		this.bflour.on("click", funkcia107);
		
		
		
		function funkcia102(evt) 
		
			{
				if (_this.ldoor.getCurrentLabel() == "startF" )
		
					{
						_this.ldoor.gotoAndPlay("animF");
					}
		
			}
		
			
		function funkcia103(evt) 
		
			
			{
				if (_this.vaza.getCurrentLabel() == "startF" )
		
					{
						_this.vaza.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia104(evt) 
		
			
			{
				if (_this.oven.getCurrentLabel() == "startF" )
		
					{
						_this.oven.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia105(evt) 
		
			
			{
				if (_this.sugar.getCurrentLabel() == "startF" )
		
					{
						_this.sugar.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia106(evt) 
		
			
			{
				if (_this.powder.getCurrentLabel() == "startF" )
		
					{
						_this.powder.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia107(evt) 
		
			
			{
				if (_this.flour.getCurrentLabel() == "startF" )
		
					{
						_this.flour.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia201(evt) 
		
			
			{
				if (_this.struhanie.getCurrentLabel() == "startF" )
		
					{
						_this.struhanie.gotoAndPlay("animF");
					}
		
			}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// btn
	this.bldoor = new lib.l1b4();
	this.bldoor.setTransform(20.2,503.5,1.168,1.708,0,0,0,-0.7,0.9);
	new cjs.ButtonHelper(this.bldoor, 0, 1, 2, false, new lib.l1b4(), 3);

	this.boven = new lib.l1b4();
	this.boven.setTransform(152.6,544.7,1.499,1.118,0,0,0,-0.6,1);
	new cjs.ButtonHelper(this.boven, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bvaza = new lib.l1b4();
	this.bvaza.setTransform(43.2,346.9,0.496,1.148,0,0,0,-0.3,0.9);
	new cjs.ButtonHelper(this.bvaza, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bflour = new lib.l1b4();
	this.bflour.setTransform(319,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bflour, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bpowder = new lib.l1b4();
	this.bpowder.setTransform(231,488.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bpowder, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsugar = new lib.l1b4();
	this.bsugar.setTransform(142,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bsugar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bstruhanie = new lib.l1b4();
	this.bstruhanie.setTransform(124.6,389.3,2.279,1.118,0,0,0,-0.6,1);
	new cjs.ButtonHelper(this.bstruhanie, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.bstruhanie},{t:this.bsugar},{t:this.bpowder},{t:this.bflour},{t:this.bvaza},{t:this.boven},{t:this.bldoor}]}).wait(1));

	// frnt
	this.ldoor = new lib.Ľavédvere();
	this.ldoor.setTransform(57.1,563.9,1,1,0,0,0,57.6,77.4);

	this.timeline.addTween(cjs.Tween.get(this.ldoor).wait(1));

	// obj
	this.struhanie = new lib.Strúhadlolvl2();
	this.struhanie.setTransform(245.5,326.4,1,1,0,0,0,-28.4,-54.2);

	this.oven = new lib.Rúra();
	this.oven.setTransform(203.1,580.6,1,1,0,0,0,77.9,54);

	this.vaza = new lib.Váza();
	this.vaza.setTransform(57,392.5,1,1,0,0,0,38.8,48.2);

	this.sugar = new lib.Sugaršuflík();
	this.sugar.setTransform(259.7,503.7,1,1,0,0,0,134.3,16.2);

	this.powder = new lib.Bakingpšuflík();
	this.powder.setTransform(260.3,502.9,1,1,0,0,0,46.6,15.8);

	this.flour = new lib.Flouršuflík();
	this.flour.setTransform(303.2,487.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.flour},{t:this.powder},{t:this.sugar},{t:this.vaza},{t:this.oven},{t:this.struhanie}]}).wait(1));

	// bg
	this.instance = new lib.BACKGROUND();
	this.instance.setTransform(202.5,360,1,1,0,0,0,202.5,360);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-80.5,-0.2,565,722);


(lib.level1 = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		var _this = this;
		
		//this.brdoor.on("click", funkcia101); 
		this.bldoor.on("click", funkcia102);
		this.bvaza.on("click", funkcia103);
		this.boven.on("click", funkcia104);
		this.bsugar.on("click", funkcia105);
		this.bpowder.on("click", funkcia106);
		this.bflour.on("click", funkcia107);
		this.bstruhadlo.on("click", funkcia108);
		this.bcarrot.on("click", funkcia109);
		this.bplate.on("click", funkcia110);
		
		
		/*
		function funkcia101(evt) 
		
			{
				if (_this.rdoor.getCurrentLabel() == "startF" )
		
					{
						_this.rdoor.gotoAndPlay("animF");
						_this.brdoor.visible = false;
					}
		
			}
		*/
		
		
		function funkcia102(evt) 
		
			{
				if (_this.ldoor.getCurrentLabel() == "startF" )
		
					{
						_this.ldoor.gotoAndPlay("animF");
					}
		
			}
		
			
		function funkcia103(evt) 
		
			
			{
				if (_this.vaza.getCurrentLabel() == "startF" )
		
					{
						_this.vaza.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia104(evt) 
		
			
			{
				if (_this.oven.getCurrentLabel() == "startF" )
		
					{
						_this.oven.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia105(evt) 
		
			
			{
				if (_this.sugar.getCurrentLabel() == "startF" )
		
					{
						_this.sugar.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia106(evt) 
		
			
			{
				if (_this.powder.getCurrentLabel() == "startF" )
		
					{
						_this.powder.gotoAndPlay("animF");
					}
		
			}
			
		function funkcia107(evt) 
		
			
			{
				if (_this.flour.getCurrentLabel() == "startF" )
		
					{
						_this.flour.gotoAndPlay("animF");
					}
		
			}
			
		
		function funkcia108(evt) 
		
			
			{
				if (_this.struhadlo.getCurrentLabel() == "startF" && _this.rdoor.timeline.position >= 19)
		
					{
						_this.struhadlo.gotoAndPlay("animF");
					}
				
				else if (_this.struhadlo.getCurrentLabel() == "startF" && _this.rdoor.getCurrentLabel() == "startF")
		
					{
						_this.struhadlo.gotoAndPlay("negF");
					}
			}
			
		function funkcia109(evt) 
		
			
			{
				if (_this.carrot.getCurrentLabel() == "startF" && _this.struhadlo.timeline.position >= 34)
		
					{
						_this.carrot.gotoAndPlay("animF");
					}
				
				else if (_this.carrot.getCurrentLabel() == "startF" && _this.struhadlo.getCurrentLabel() == "startF")
		
					{
						_this.carrot.gotoAndPlay("negF");
					}
			}
			
			
		function funkcia110(evt) 
		
			
			{
				if (_this.plate.getCurrentLabel() == "startF" && _this.carrot.timeline.position >= 29)
		
					{
						_this.plate.gotoAndPlay("animF");
					}
				
				else if (_this.plate.getCurrentLabel() == "startF" && _this.carrot.getCurrentLabel() == "startF")
		
					{
						_this.plate.gotoAndPlay("negF");
					}
			}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(1));

	// btn
	this.bldoor = new lib.l1b4();
	this.bldoor.setTransform(20.2,503.5,1.168,1.708,0,0,0,-0.7,0.9);
	new cjs.ButtonHelper(this.bldoor, 0, 1, 2, false, new lib.l1b4(), 3);

	this.boven = new lib.l1b4();
	this.boven.setTransform(152.6,544.7,1.499,1.118,0,0,0,-0.6,1);
	new cjs.ButtonHelper(this.boven, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bvaza = new lib.l1b4();
	this.bvaza.setTransform(43.2,346.9,0.496,1.148,0,0,0,-0.3,0.9);
	new cjs.ButtonHelper(this.bvaza, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bflour = new lib.l1b4();
	this.bflour.setTransform(319,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bflour, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bpowder = new lib.l1b4();
	this.bpowder.setTransform(231,488.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bpowder, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bsugar = new lib.l1b4();
	this.bsugar.setTransform(142,487.5,0.866,0.447,0,0,0,-0.2,-0.1);
	new cjs.ButtonHelper(this.bsugar, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bstruhadlo = new lib.l1b4();
	this.bstruhadlo.setTransform(351.5,537.8,0.438,0.773,0,0,0,-0.2,0.8);
	new cjs.ButtonHelper(this.bstruhadlo, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bcarrot = new lib.l1b4();
	this.bcarrot.setTransform(303.6,571.1,0.72,0.376,0,0,0,-0.4,0.1);
	new cjs.ButtonHelper(this.bcarrot, 0, 1, 2, false, new lib.l1b4(), 3);

	this.bplate = new lib.l1b4();
	this.bplate.setTransform(306.1,608.8,1.061,0.447,0,0,0,-0.1,-0.1);
	new cjs.ButtonHelper(this.bplate, 0, 1, 2, false, new lib.l1b4(), 3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.bplate},{t:this.bcarrot},{t:this.bstruhadlo},{t:this.bsugar},{t:this.bpowder},{t:this.bflour},{t:this.bvaza},{t:this.boven},{t:this.bldoor}]}).wait(1));

	// tutorial
	this.instance = new lib.Symbol4();
	this.instance.setTransform(301.1,490.6,1,1,0,0,0,56,56.9);

	this.timeline.addTween(cjs.Tween.get(this.instance).wait(1));

	// frnt
	this.rdoor = new lib.Pravédvere();
	this.rdoor.setTransform(343.1,579.6,1,1,0,0,0,50.6,54.6);

	this.ldoor = new lib.Ľavédvere();
	this.ldoor.setTransform(57.1,563.9,1,1,0,0,0,57.6,77.4);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.ldoor},{t:this.rdoor}]}).wait(1));

	// obj
	this.plate = new lib.Tanierlvl1();
	this.plate.setTransform(343.6,619,1,1,0,0,0,50.4,15.6);

	this.struhadlo = new lib.Struhadlolvl1();
	this.struhadlo.setTransform(368.6,561.3,1,1,0,0,0,23.7,34.1);

	this.carrot = new lib.Mrkvanapoličke();
	this.carrot.setTransform(294.3,573.5);

	this.oven = new lib.Rúra();
	this.oven.setTransform(203.1,580.6,1,1,0,0,0,77.9,54);

	this.vaza = new lib.Váza();
	this.vaza.setTransform(57,392.5,1,1,0,0,0,38.8,48.2);

	this.sugar = new lib.Sugaršuflík();
	this.sugar.setTransform(259.7,503.7,1,1,0,0,0,134.3,16.2);

	this.powder = new lib.Bakingpšuflík();
	this.powder.setTransform(260.3,502.9,1,1,0,0,0,46.6,15.8);

	this.flour = new lib.Flouršuflík();
	this.flour.setTransform(303.2,487.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.flour},{t:this.powder},{t:this.sugar},{t:this.vaza},{t:this.oven},{t:this.carrot},{t:this.struhadlo},{t:this.plate}]}).wait(1));

	// bg
	this.instance_1 = new lib.BACKGROUND();
	this.instance_1.setTransform(202.5,360,1,1,0,0,0,202.5,360);

	this.timeline.addTween(cjs.Tween.get(this.instance_1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-162.2,-0.2,646.8,722);


// stage content:
(lib.fccc = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.stop();
		
		var _stage = this;
		this.bpause.on("click", pauseF);
		
		
		function pauseF(evt) 
		{
			PokiSDK.gameplayStop();
			_stage.pauseScreen.gotoAndStop(1);
			createjs.Ticker.removeEventListener("tick", stage);
			stage.update();
		}
				
		exportRoot.pauseScreen.visible = false;
				
		
		exportRoot.pauseS.visible = false;
		exportRoot.bpause.visible = false;
		this.breprak.on("click", funkciaZ);
		
		exportRoot.breprak.visible = false;
		exportRoot.reprak.visible = false;
		
		document.addEventListener("keydown", onKeyboardDown);
		function onKeyboardDown(event) {
			if (event.keyCode == 32) {
				if (stage.contains(exportRoot.menucko))
					funkcia01();
			}
		}

		funkcia01 = function(evt) {
			console.log("funkcia01");
			playCommercial();
			stage.removeAllChildren();
			stage.update();
			if (cislo == 1) {
				stage.addChild(exportRoot.level1);
			}

			else {
				stage.addChild(exportRoot["level" + cislo]);
			}
			stage.addChild(exportRoot.reprak);
			stage.addChild(exportRoot.breprak);
			exportRoot.reprak.visible = true;
			exportRoot.breprak.visible = true;

			stage.addChild(exportRoot.score);
			stage.addChild(exportRoot.pauseS);
			stage.addChild(exportRoot.bpause);
			exportRoot.pauseS.visible = true;
			exportRoot.bpause.visible = true;
			stage.addChild(exportRoot.pauseScreen);
			exportRoot.pauseScreen.visible = true;
			exportRoot.ID = setInterval(TimerC, 1000, "Interval called0");
			stage.update();

			somVmenu = 0;

			if (cislo == 1) {
				exportRoot.score.score.text = String(0);
			}
			else {
				//clearInterval(_this.ID);


			}
			playSound("ZIP1");
			PokiSDK.gameplayStart();

		}
		
		function funkciaZ(evt)
		
		{
			
			if (_stage.reprak.timeline.position == 0)
		
			{
				createjs.Sound.setMute(true);
				_stage.breprak.visible = false;
				_stage.reprak.gotoAndPlay(1);
				
				
		
			} else if (_stage.reprak.timeline.position == 14)
		
			{
				//console.log('mute vis p1');
				createjs.Sound.setMute(false);
				_stage.breprak.visible = false;
				_stage.reprak.gotoAndPlay(15);
				//console.log('mute vis p2');
		
			}
		
			
		} 
		
		
		exportLevel = function () {
			cislo++;
			stage.removeAllChildren();
			stage.update();
			stage.addChild(exportRoot["level" + cislo]);
			stage.addChild(exportRoot.reprak);
			stage.addChild(exportRoot.breprak);
		
			stage.addChild(exportRoot.score);
		
			stage.addChild(exportRoot.pauseS);
			stage.addChild(exportRoot.bpause);
			stage.addChild(exportRoot.pauseScreen);

			exportRoot.pauseScreen.visible = true;
			
			stage.update();
		}
		TimerC = function()
		{
			if(_stage.pauseScreen.timeline.position == 0)
			{
				
					exportRoot.score.score.text=String(Number(exportRoot.score.score.text)+1);
				
			}
		}
		
			  
		stopujI=function()
		{
			clearInterval(_stage.ID);
		}
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(16));

	// pauseScreen
	this.pauseScreen = new lib.pasueScreen();
	this.pauseScreen.setTransform(202.5,360,1,1,0,0,0,202.5,360);

	this.timeline.addTween(cjs.Tween.get(this.pauseScreen).to({_off:true},1).wait(15));

	// pause
	this.bpause = new lib.l1b4();
	this.bpause.setTransform(12.7,663.4,0.594,0.619,0,0,0,0,0.3);
	new cjs.ButtonHelper(this.bpause, 0, 1, 2, false, new lib.l1b4(), 3);

	this.pauseS = new lib.pause_buttonik();
	this.pauseS.setTransform(33,684.9,1,1,0,0,0,25.1,25.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.pauseS},{t:this.bpause}]}).to({state:[]},1).wait(15));

	// music
	this.breprak = new lib.l1b4();
	this.breprak.setTransform(350.7,663.4,0.594,0.619,0,0,0,0,0.3);
	new cjs.ButtonHelper(this.breprak, 0, 1, 2, false, new lib.l1b4(), 3);

	this.reprak = new lib.reprak();
	this.reprak.setTransform(371,684.9,1,1,0,0,0,25.1,25.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.reprak},{t:this.breprak}]}).to({state:[]},1).wait(15));

	// levels
	this.menucko = new lib.menucko();
	this.menucko.setTransform(202.5,360,1,1,0,0,0,202.5,360);

	this.level1 = new lib.level1();
	this.level1.setTransform(202,360.9,1,1,0,0,0,202,360.9);

	this.level2 = new lib.level2();
	this.level2.setTransform(202,360.9,1,1,0,0,0,202,360.9);

	this.level3 = new lib.level3();
	this.level3.setTransform(202,360.9,1,1,0,0,0,202,360.9);

	this.level4 = new lib.level4();
	this.level4.setTransform(202,360.9,1,1,0,0,0,202,360.9);

	this.level5 = new lib.level5();
	this.level5.setTransform(202,360.9,1,1,0,0,0,202,360.9);

	this.level6 = new lib.level6();
	this.level6.setTransform(202,360.9,1,1,0,0,0,202,360.9);

	this.level7 = new lib.level7();
	this.level7.setTransform(202,360.9,1,1,0,0,0,202,360.9);

	this.level8 = new lib.level8();
	this.level8.setTransform(202,360.9,1,1,0,0,0,202,360.9);

	this.level9 = new lib.level9();
	this.level9.setTransform(202,360.9,1,1,0,0,0,202,360.9);

	this.level10 = new lib.level10();
	this.level10.setTransform(202,360.9,1,1,0,0,0,202,360.9);

	this.level11 = new lib.level11();
	this.level11.setTransform(202,360.9,1,1,0,0,0,202,360.9);

	this.level12 = new lib.level12();
	this.level12.setTransform(202,360.9,1,1,0,0,0,202,360.9);

	this.level13 = new lib.level13();
	this.level13.setTransform(202,360.9,1,1,0,0,0,202,360.9);

	this.level14 = new lib.level14();
	this.level14.setTransform(202,360.9,1,1,0,0,0,202,360.9);

	this.level15 = new lib.theend();
	this.level15.setTransform(233.8,303.8,1,1,0,0,0,620.5,443.1);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.menucko}]}).to({state:[{t:this.level1}]},1).to({state:[{t:this.level2}]},1).to({state:[{t:this.level3}]},1).to({state:[{t:this.level4}]},1).to({state:[{t:this.level5}]},1).to({state:[{t:this.level6}]},1).to({state:[{t:this.level7}]},1).to({state:[{t:this.level8}]},1).to({state:[{t:this.level9}]},1).to({state:[{t:this.level10}]},1).to({state:[{t:this.level11}]},1).to({state:[{t:this.level12}]},1).to({state:[{t:this.level13}]},1).to({state:[{t:this.level14}]},1).to({state:[{t:this.level15}]},1).wait(1));

	// score
	this.score = new lib.score_symbol();
	this.score.setTransform(204,717.9,1,1,0,0,0,74.7,74.7);

	this.timeline.addTween(cjs.Tween.get(this.score).to({_off:true},1).wait(15));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(198.7,289.3,427,863.4);

})(lib = lib||{}, images = images||{}, createjs = createjs||{});
var lib, images, createjs;