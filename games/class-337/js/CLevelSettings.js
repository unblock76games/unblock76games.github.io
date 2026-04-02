function CLevelSettings(){
    var _aJson;

    var _aCurveLevel;
    var _aBgPerLevel;
    
    this._init = function(){
        _aJson = new Array();
        
        _aJson[0] = {
            bg_image:"bg_game",
            track_pos:{x:0,y:0},
            semaphore_info:{x:337,y:168,rot:0,scale:1},
            crossing:true,
            curve_point:[
                    {x:503.3,y:132.35,type:0},
                    {x:673.3,y:132.35,type:0},
                    {x:710.1,y:143.6,type:1},
                    {x:730.1,y:156.1,type:1},
                    {x:755.85,y:176.1,type:1},
                    {x:777.6,y:203.6,type:1},
                    {x:792.6,y:233.6,type:1},
                    {x:801.35,y:269.85,type:1},
                    {x:802.1,y:298.6,type:2},
                    {x:798.35,y:323.55,type:1},
                    {x:786.35,y:357.05,type:1},
                    {x:769.35,y:384.05,type:1},
                    {x:747.35,y:407.3,type:1},
                    {x:723.35,y:424.8,type:1},
                    {x:697.85,y:436.8,type:1},
                    {x:672.85,y:443.8,type:1},
                    {x:649.35,y:446.6,type:0},
                    {x:309.35,y:446.6,type:0},
                    {x:288.35,y:443.8,type:1},
                    {x:263.35,y:436.8,type:1},
                    {x:237.85,y:424.8,type:1},
                    {x:213.85,y:407.3,type:1},
                    {x:191.85,y:384.05,type:1},
                    {x:174.85,y:357.05,type:1},
                    {x:162.85,y:323.55,type:1},
                    {x:159.1,y:298.6,type:2},
                    {x:159.8,y:269.85,type:1},
                    {x:168.55,y:233.6,type:1},
                    {x:183.55,y:203.6,type:1},
                    {x:205.3,y:176.1,type:1},
                    {x:231.05,y:156.1,type:1},
                    {x:251.05,y:143.6,type:1},
                    {x:288.3,y:132.35,type:0},
                    {x:503.3,y:132.35,type:0}
            ]
        };
        
        _aJson[1] = {
            bg_image:"bg_game",
            track_pos:{x:0,y:0},
            semaphore_info:{x:228,y:324,rot:-36,scale:0.86},
            crossing:true,
            curve_point:[
						{x:319.5,y:207.7,type:0},
						{x:427.2,y:129.95,type:0},
						{x:457.5,y:111.75,type:1},
						{x:487.65,y:102.45,type:1},
						{x:521.15,y:100.4,type:0},
						{x:667.4,y:133.15,type:1},
						{x:699.6,y:140.45,type:2},
						{x:728.85,y:150.8,type:2},
						{x:753.75,y:168.95,type:2},
						{x:774.95,y:192.55,type:2},
						{x:786.35,y:223.35,type:2},
						{x:792.15,y:253.7,type:2},
						{x:791.2,y:285.35,type:2},
						{x:784.7,y:317.9,type:2},
						{x:770.2,y:349.05,type:1},
						{x:749.55,y:373.85,type:1},
						{x:720.9,y:395.35,type:1},
						{x:689.7,y:408.2,type:0},
						{x:431.1,y:442.7,type:0},
						{x:380.9,y:441.7,type:0},
						{x:324.8,y:432.35,type:0},
						{x:222.45,y:416.85,type:1},
						{x:189.25,y:406.5,type:2},
						{x:166.7,y:376.8,type:2},
						{x:164.4,y:344.4,type:1},
						{x:181.55,y:310.3,type:0},
						{x:319.5,y:207.7,type:0}

            ]
        };
        
        _aJson[2] = {
                        bg_image:"bg_game",
                        track_pos:{x:0,y:0},
                        semaphore_info:{x:374,y:144,rot:0,scale:0.83},
                        crossing:true,
                        curve_point:[   
                                {x:535.35,y:109.35,type:0},
                                {x:655.35,y:109.35,type:0},
                                {x:691.85,y:111.6,type:1},
                                {x:729.35,y:124.1,type:1},
                                {x:759.1,y:146.85,type:1},
                                {x:779.35,y:177.6,type:2},
                                {x:789.35,y:207.6,type:2},
                                {x:792.85,y:236.35,type:1},
                                {x:791.85,y:299.6,type:0},
                                {x:790.35,y:343.85,type:1},
                                {x:780.35,y:376.35,type:1},
                                {x:763.35,y:403.85,type:1},
                                {x:730.35,y:431.6,type:2},
                                {x:692.85,y:441.6,type:2},
                                {x:659.35,y:439.1,type:2},
                                {x:530.85,y:406.6,type:1},
                                {x:499.1,y:403.1,type:1},
                                {x:468.35,y:406.6,type:1},
                                {x:334.1,y:439.1,type:2},
                                {x:300.6,y:441.6,type:2},
                                {x:263.1,y:431.6,type:2},
                                {x:230.1,y:403.85,type:1},
                                {x:213.1,y:376.35,type:1},
                                {x:203.1,y:343.85,type:1},
                                {x:201.6,y:299.6,type:0},
                                {x:200.6,y:236.35,type:1},
                                {x:204.1,y:207.6,type:2},
                                {x:214.1,y:177.6,type:2},
                                {x:234.35,y:146.85,type:1},
                                {x:264.1,y:124.1,type:1},
                                {x:301.6,y:111.6,type:1},
                                {x:338.1,y:109.35,type:0},
                                {x:535.35,y:109.35,type:0}
                        ]
            
        };
        
        _aJson[3] = { 
                      bg_image:"bg_game",
                      track_pos:{x:0,y:0},
                      semaphore_info:{x:486,y:345,rot:43,scale:0.66},
                      crossing:false,
                      curve_point:[   
                                    {x:521.35,y:326.35,type:0},
                                    {x:604.95,y:407.7,type:0},
                                    {x:642.1,y:422.6,type:1},
                                    {x:680.1,y:426.35,type:1},
                                    {x:717.6,y:424.1,type:1},
                                    {x:750.1,y:409.1,type:1},
                                    {x:771.85,y:393.85,type:2},
                                    {x:794.35,y:368.85,type:2},
                                    {x:811.1,y:338.85,type:2},
                                    {x:820.35,y:307.6,type:2},
                                    {x:821.35,y:285.85,type:3},
                                    {x:820.35,y:261.05,type:2},
                                    {x:811.1,y:229.8,type:2},
                                    {x:794.35,y:199.8,type:2},
                                    {x:771.85,y:174.8,type:2},
                                    {x:750.1,y:159.55,type:1},
                                    {x:717.6,y:144.55,type:1},
                                    {x:680.1,y:142.3,type:1},
                                    {x:642.1,y:146.05,type:1},
                                    {x:604.95,y:160.95,type:0},
                                    {x:521.35,y:245.05,type:0},
                                    {x:436.6,y:326.35,type:0},
                                    {x:353,y:407.7,type:0},
                                    {x:315.85,y:422.6,type:1},
                                    {x:277.85,y:426.35,type:1},
                                    {x:240.35,y:424.1,type:1},
                                    {x:207.85,y:409.1,type:1},
                                    {x:186.1,y:393.85,type:2},
                                    {x:163.6,y:368.85,type:2},
                                    {x:146.85,y:338.85,type:2},
                                    {x:137.6,y:307.6,type:2},
                                    {x:136.6,y:285.85,type:3},
                                    {x:137.6,y:261.05,type:2},
                                    {x:146.85,y:229.8,type:2},
                                    {x:163.6,y:199.8,type:2},
                                    {x:186.1,y:174.8,type:2},
                                    {x:207.85,y:159.55,type:1},
                                    {x:240.35,y:144.55,type:1},
                                    {x:277.85,y:142.3,type:1},
                                    {x:315.85,y:146.05,type:1},
                                    {x:353,y:160.95,type:0},
                                    {x:436.6,y:245.05,type:0},
                                    {x:521.35,y:326.35,type:0}

               ] };
           
           
           _aJson[4] = { 
                      bg_image:"bg_game",
                      track_pos:{x:0,y:0},
                      semaphore_info:{x:371,y:112,rot:0,scale:1},
                      crossing:true,
                      curve_point:[   
                                {x:534.85,y:85.35,type:0},
                                {x:664.85,y:85.35,type:0},
                                {x:698.8,y:98.35,type:1},
                                {x:728.8,y:114.85,type:1},
                                {x:749.3,y:138.35,type:1},
                                {x:759.8,y:173.35,type:2},
                                {x:753.3,y:207.85,type:2},
                                {x:737.3,y:234.85,type:2},
                                {x:707.3,y:258.35,type:2},
                                {x:670.8,y:269.35,type:1},
                                {x:638.3,y:274.35,type:1},
                                {x:603.3,y:282.85,type:1},
                                {x:568.8,y:298.35,type:2},
                                {x:542.8,y:326.35,type:2},
                                {x:534.85,y:361.85,type:3},
                                {x:522.8,y:396.35,type:2},
                                {x:502.8,y:427.85,type:2},
                                {x:472.3,y:447.85,type:2},
                                {x:442.3,y:458.35,type:2},
                                {x:407.85,y:459.8,type:1},
                                {x:347.35,y:454.8,type:1},
                                {x:283.35,y:433.8,type:0},
                                {x:233.35,y:393.8,type:0},
                                {x:196.85,y:333.8,type:1},
                                {x:186.85,y:263.8,type:1},
                                {x:196.85,y:193.8,type:1},
                                {x:233.35,y:133.8,type:1},
                                {x:283.35,y:93.8,type:1},
                                {x:373.35,y:85.35,type:1},
                                {x:534.85,y:85.35,type:0}
               ] };
           
           
           
           
                      _aJson[5] = { 
                      bg_image:"bg_game",
                      track_pos:{x:0,y:0},
                      semaphore_info:{x:437,y:309,rot:0,scale:1},
                      crossing:true,
                      curve_point:[   
                                    {x:508.3,y:89.35,type:0},
                                    {x:718.3,y:89.35,type:1},
                                    {x:755.3,y:110.85,type:2},
                                    {x:764.8,y:139.85,type:3},
                                    {x:755.3,y:168.85,type:2},
                                    {x:718.3,y:190.35,type:0},
                                    {x:394.8,y:185.35,type:1},
                                    {x:357.8,y:206.85,type:2},
                                    {x:348.3,y:235.85,type:3},
                                    {x:357.8,y:264.85,type:2},
                                    {x:394.8,y:286.35,type:0},
                                    {x:705.8,y:286.35,type:0},
                                    {x:729.3,y:290.35,type:1},
                                    {x:749.3,y:307.35,type:2},
                                    {x:756.3,y:328.85,type:2},
                                    {x:756.3,y:371.85,type:1},
                                    {x:756.3,y:415.35,type:2},
                                    {x:749.3,y:436.85,type:2},
                                    {x:729.3,y:453.85,type:1},
                                    {x:705.8,y:457.85,type:0},
                                    {x:285.8,y:457.85,type:0},
                                    {x:264.8,y:448.85,type:1},
                                    {x:251.3,y:434.85,type:1},
                                    {x:244.8,y:418.85,type:1},
                                    {x:244.3,y:382.85,type:0},
                                    {x:244.3,y:164.85,type:0},
                                    {x:244.8,y:128.85,type:1},
                                    {x:252.3,y:112.35,type:1},
                                    {x:264.8,y:98.85,type:1},
                                    {x:285.8,y:89.85,type:0},
                                    {x:508.3,y:89.35,type:0}
               ] };
           
        _aJson[6] ={
            bg_image:"bg_game",
                   track_pos:{x:0,y:0},
                   semaphore_info:{x:430,y:99,rot:0,scale:1},
                   crossing:true,
                   curve_point:[
                        {x:526.35,y:78.35,type:0},
                        {x:711.35,y:78.35,type:0},
                        {x:744.3,y:87.85,type:1},
                        {x:760.3,y:99.85,type:1},
                        {x:772.3,y:115.35,type:1},
                        {x:781.3,y:133.85,type:2},
                        {x:781.3,y:152.85,type:0},
                        {x:781.3,y:399.85,type:2},
                        {x:772.3,y:418.35,type:1},
                        {x:760.3,y:433.85,type:1},
                        {x:744.3,y:445.85,type:1},
                        {x:726.3,y:454.35,type:1},
                        {x:711.35,y:455.35,type:2},
                        {x:681.35,y:448.85,type:2},
                        {x:661.3,y:435.85,type:1},
                        {x:646.8,y:420.85,type:0},
                        {x:391.8,y:170.85,type:0},
                        {x:364.35,y:160.85,type:1},
                        {x:337.35,y:162.35,type:1},
                        {x:313.35,y:172.85,type:2},
                        {x:294.35,y:195.35,type:2},
                        {x:285.35,y:222.85,type:2},
                        {x:288.35,y:252.85,type:2},
                        {x:341.8,y:314.85,type:0},
                        {x:364.35,y:327.85,type:1},
                        {x:394.35,y:331.35,type:1},
                        {x:422.35,y:341.35,type:1},
                        {x:445.35,y:364.85,type:1},
                        {x:456.45,y:393.85,type:2},
                        {x:449.95,y:421.2,type:2},
                        {x:437.45,y:447.2,type:2},
                        {x:415.45,y:465.7,type:2},
                        {x:391.8,y:471.7,type:1},
                        {x:370.45,y:471.7,type:0},
                        {x:251.3,y:465.35,type:1},
                        {x:233.3,y:453.35,type:1},
                        {x:220.3,y:437.85,type:1},
                        {x:211.8,y:419.35,type:2},
                        {x:208.3,y:394.35,type:0},
                        {x:208.3,y:155.35,type:0},
                        {x:211.8,y:130.35,type:2},
                        {x:220.3,y:111.85,type:1},
                        {x:233.3,y:96.35,type:1},
                        {x:251.3,y:84.35,type:1},
                        {x:274.45,y:78.85,type:0},
                        {x:526.35,y:78.35,type:0}
                       ] 
        };
        
        
        _aJson[7] ={
            bg_image:"bg_game",
                   track_pos:{x:0,y:0},
                   semaphore_info:{x:371,y:191,rot:0,scale:1},
                   crossing:true,
                   curve_point:[
                        {x:390.35,y:88.85,type:0},
                        {x:722.85,y:88.35,type:0},
                        {x:770.3,y:108.35,type:1},
                        {x:794.8,y:138.85,type:1},
                        {x:804.8,y:184.35,type:0},
                        {x:804.3,y:254.35,type:0},
                        {x:795.8,y:285.85,type:1},
                        {x:779.3,y:310.85,type:1},
                        {x:760.3,y:326.35,type:0},
                        {x:620.3,y:424.35,type:0},
                        {x:592.8,y:427.35,type:2},
                        {x:572.85,y:417.35,type:3},
                        {x:552.85,y:386.35,type:3},
                        {x:549.85,y:348.35,type:3},
                        {x:567.35,y:316.85,type:3},
                        {x:598.35,y:298.35,type:3},
                        {x:624.35,y:291.85,type:3},
                        {x:648.3,y:267.35,type:2},
                        {x:654.8,y:237.35,type:2},
                        {x:651.3,y:217.35,type:2},
                        {x:638.8,y:188.85,type:2},
                        {x:612.8,y:171.85,type:1},
                        {x:592.3,y:169.35,type:1},
                        {x:570.8,y:170.35,type:0},
                        {x:357.3,y:172.35,type:0},
                        {x:331.3,y:176.85,type:1},
                        {x:311.3,y:196.85,type:1},
                        {x:299.8,y:223.85,type:2},
                        {x:300.3,y:251.35,type:1},
                        {x:325.3,y:306.35,type:1},
                        {x:345.8,y:322.35,type:2},
                        {x:376.8,y:328.35,type:1},
                        {x:438.3,y:337.85,type:0},
                        {x:456.8,y:356.85,type:2},
                        {x:461.35,y:366.35,type:3},
                        {x:465.35,y:384.35,type:3},
                        {x:466.35,y:401.35,type:3},
                        {x:460.85,y:420.35,type:3},
                        {x:446.85,y:441.85,type:3},
                        {x:434.35,y:452.85,type:3},
                        {x:421.35,y:457.35,type:3},
                        {x:402.8,y:457.35,type:2},
                        {x:376.3,y:448.85,type:1},
                        {x:358.8,y:435.85,type:0},
                        {x:190.8,y:314.35,type:0},
                        {x:179.3,y:300.35,type:1},
                        {x:168.3,y:275.35,type:1},
                        {x:164.3,y:247.85,type:1},
                        {x:164.8,y:229.85,type:0},
                        {x:165.8,y:177.85,type:0},
                        {x:171.3,y:151.85,type:1},
                        {x:179.8,y:133.85,type:1},
                        {x:197.3,y:109.85,type:1},
                        {x:216.8,y:95.35,type:1},
                        {x:247.35,y:89.35,type:0},
                        {x:390.35,y:88.85,type:0}
                       ] 
        };
        
        NUM_LEVELS = _aJson.length;

        this._initCurveLevel();
        this._initBgLevel();
    };

    
    this._initCurveLevel = function(){
        _aCurveLevel = new Array();
        
        for(var i=0;i<NUM_LEVELS;i++){
            _aCurveLevel[i] = new Array();
            var aPoints = _aJson[i].curve_point;
            for(var j=0;j<aPoints.length;j++){
                _aCurveLevel[i].push( {x:aPoints[j].x,y:aPoints[j].y,type:aPoints[j].type});
            }
        }
        
    };
    
    this._initBgLevel = function(){
        _aBgPerLevel = new Array();
        
        for(var i=0;i<NUM_LEVELS;i++){
            _aBgPerLevel[i] = _aJson[i].bg_image;
        }
    };

    this.getCurveForLevel = function(iLevel){
        return _aCurveLevel[iLevel-1];
    };
    
    this.getNumLevels = function(){
        return _aCurveLevel.length;
    };
    
    this.getBgForLevel = function(iLevel){
        return _aBgPerLevel[iLevel-1];
    };
    
    this.getTrackPos = function(iLevel){
        return _aJson[iLevel-1].track_pos;
    };
    
    this.getSemaphoreInfo = function(iLevel){
        return _aJson[iLevel-1].semaphore_info;
    };
    
    this.isTrackWithCrossing = function(iLevel){
        return _aJson[iLevel-1].crossing;
    };
    
     this._init();
}