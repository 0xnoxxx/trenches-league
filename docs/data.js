/* Trenches League · countries, leagues, languages */
var GEO_TABLE=`Somalia:SO:SOM|Liechtenstein:LI:LIE|Morocco:MA:MAR|Serbia:RS:SRB|Afghanistan:AF:AFG|Angola:AO:AGO|Albania:AL:ALB|Andorra:AD:AND|United Arab Emirates:AE:ARE|Argentina:AR:ARG|Armenia:AM:ARM|Antigua and Barb.:AG:ATG|Australia:AU:AUS|Austria:AT:AUT|Azerbaijan:AZ:AZE|Burundi:BI:BDI|Belgium:BE:BEL|Benin:BJ:BEN|Burkina Faso:BF:BFA|Bangladesh:BD:BGD|Bulgaria:BG:BGR|Bahrain:BH:BHR|Bahamas:BS:BHS|Bosnia and Herz.:BA:BIH|Belarus:BY:BLR|Belize:BZ:BLZ|Bolivia:BO:BOL|Brazil:BR:BRA|Barbados:BB:BRB|Brunei:BN:BRN|Bhutan:BT:BTN|Botswana:BW:BWA|Central African Rep.:CF:CAF|Canada:CA:CAN|Switzerland:CH:CHE|Chile:CL:CHL|China:CN:CHN|Côte d'Ivoire:CI:CIV|Cameroon:CM:CMR|Dem. Rep. Congo:CD:COD|Congo:CG:COG|Colombia:CO:COL|Comoros:KM:COM|Cape Verde:CV:CPV|Costa Rica:CR:CRI|Cuba:CU:CUB|Cyprus:CY:CYP|Czech Rep.:CZ:CZE|Germany:DE:DEU|Djibouti:DJ:DJI|Dominica:DM:DMA|Denmark:DK:DNK|Dominican Rep.:DO:DOM|Algeria:DZ:DZA|Ecuador:EC:ECU|Egypt:EG:EGY|Eritrea:ER:ERI|Spain:ES:ESP|Estonia:EE:EST|Ethiopia:ET:ETH|Finland:FI:FIN|Fiji:FJ:FJI|France:FR:FRA|Micronesia:FM:FSM|Gabon:GA:GAB|United Kingdom:GB:GBR|Georgia:GE:GEO|Ghana:GH:GHA|Guinea:GN:GIN|Gambia:GM:GMB|Guinea-Bissau:GW:GNB|Eq. Guinea:GQ:GNQ|Greece:GR:GRC|Grenada:GD:GRD|Guatemala:GT:GTM|Guyana:GY:GUY|Honduras:HN:HND|Croatia:HR:HRV|Haiti:HT:HTI|Hungary:HU:HUN|Indonesia:ID:IDN|India:IN:IND|Ireland:IE:IRL|Iran:IR:IRN|Iraq:IQ:IRQ|Iceland:IS:ISL|Israel:IL:ISR|Italy:IT:ITA|Jamaica:JM:JAM|Jordan:JO:JOR|Japan:JP:JPN|Kazakhstan:KZ:KAZ|Kenya:KE:KEN|Kyrgyzstan:KG:KGZ|Cambodia:KH:KHM|Kiribati:KI:KIR|Korea:KR:KOR|Kuwait:KW:KWT|Lao PDR:LA:LAO|Lebanon:LB:LBN|Liberia:LR:LBR|Libya:LY:LBY|Saint Lucia:LC:LCA|Sri Lanka:LK:LKA|Lesotho:LS:LSO|Lithuania:LT:LTU|Luxembourg:LU:LUX|Latvia:LV:LVA|Moldova:MD:MDA|Madagascar:MG:MDG|Mexico:MX:MEX|Macedonia:MK:MKD|Mali:ML:MLI|Malta:MT:MLT|Myanmar:MM:MMR|Montenegro:ME:MNE|Mongolia:MN:MNG|Mozambique:MZ:MOZ|Mauritania:MR:MRT|Mauritius:MU:MUS|Malawi:MW:MWI|Malaysia:MY:MYS|Namibia:NA:NAM|Niger:NE:NER|Nigeria:NG:NGA|Nicaragua:NI:NIC|Netherlands:NL:NLD|Norway:NO:NOR|Nepal:NP:NPL|New Zealand:NZ:NZL|Oman:OM:OMN|Pakistan:PK:PAK|Panama:PA:PAN|Peru:PE:PER|Philippines:PH:PHL|Palau:PW:PLW|Papua New Guinea:PG:PNG|Poland:PL:POL|Portugal:PT:PRT|Paraguay:PY:PRY|Palestine:PS:PSE|Qatar:QA:QAT|Romania:RO:ROU|Russia:RU:RUS|Rwanda:RW:RWA|Saudi Arabia:SA:SAU|Sudan:SD:SDN|S. Sudan:SS:SSD|Senegal:SN:SEN|Singapore:SG:SGP|Solomon Is.:SB:SLB|Sierra Leone:SL:SLE|El Salvador:SV:SLV|São Tomé and Principe:ST:STP|Suriname:SR:SUR|Slovakia:SK:SVK|Slovenia:SI:SVN|Sweden:SE:SWE|Swaziland:SZ:SWZ|Seychelles:SC:SYC|Syria:SY:SYR|Chad:TD:TCD|Togo:TG:TGO|Thailand:TH:THA|Tajikistan:TJ:TJK|Turkmenistan:TM:TKM|Timor-Leste:TL:TLS|Tonga:TO:TON|Trinidad and Tobago:TT:TTO|Tunisia:TN:TUN|Turkey:TR:TUR|Tanzania:TZ:TZA|Uganda:UG:UGA|Ukraine:UA:UKR|Uruguay:UY:URY|United States:US:USA|Uzbekistan:UZ:UZB|St. Vin. and Gren.:VC:VCT|Venezuela:VE:VEN|Vietnam:VN:VNM|Vanuatu:VU:VUT|Samoa:WS:WSM|Yemen:YE:YEM|South Africa:ZA:ZAF|Zambia:ZM:ZMB|Zimbabwe:ZW:ZWE`;
var LEAGUE_LISTS=[
 'US IN GB MX RU ES KR PH EG TH PK CA',
 'TR PL BR AR ID NG VN UA FR DE IT JP',
 'CO CL PE VE MY BD IR IQ SA MA DZ ZA KE NL BE SE PT GR RO CZ HU AU AZ KZ',
 'EC BO PY UY CR PA GT DO CU HN SV NI TN LY JO LB SY AE QA KW OM YE AF UZ GH ET TZ UG CM CI SN AO ZW ZM MZ AT CH DK NO FI IE RS HR BG SK LT NZ GE'
];
var LANG_OF=(function(){var m={};
 var g={tr:'TR',es:'ES MX AR CO CL PE VE EC GT CU BO DO HN PY SV NI CR PA UY GQ',pt:'BR PT AO MZ CV GW ST TL',
  fr:'FR BE LU CI SN CM ML BF NE GN BJ TG CD CG GA MG HT TD CF DJ KM BI DZ MA TN',de:'DE AT CH LI',id:'ID',ru:'RU BY KZ KG'};
 for(var l in g)g[l].split(' ').forEach(function(c){m[c]=l});return m})();
/* tuned values for League 1, the league the demo story starts in */
var HAND={TR:[48210,312400,9.2],PL:[39880,313640,9.6],BR:[61420,351200,10.5],AR:[37150,311540,9.05],ID:[58700,340500,10.1],NG:[33400,288000,8.4],VN:[35100,296400,8.7],UA:[30250,270100,7.9],FR:[28900,251300,7.4],DE:[27600,249800,7.5],IT:[26100,238700,7.0],JP:[24800,231000,6.9]};
var SENSITIVE=[['RU','UA'],['IL','PS'],['IN','PK'],['AM','AZ'],['KR','KP'],['ET','ER'],['SD','SS'],['SA','YE']];
var CITIES={
 TR:[['İstanbul',28.97,41.01],['Ankara',32.85,39.93],['İzmir',27.14,38.42],['Bursa',29.06,40.19],['Antalya',30.71,36.89],['Adana',35.32,37.0],['Konya',32.48,37.87],['Gaziantep',37.38,37.07],['Kayseri',35.48,38.73],['Trabzon',39.72,41.0],['Diyarbakır',40.23,37.91],['Erzurum',41.27,39.9],['Samsun',36.33,41.29],['Van',43.38,38.5],['Eskişehir',30.52,39.78],['Sivas',37.02,39.75],['Malatya',38.31,38.35],['Edirne',26.56,41.68],['Denizli',29.09,37.78],['Şanlıurfa',38.79,37.16]],
 PL:[['Warszawa',21.01,52.23],['Kraków',19.94,50.06],['Gdańsk',18.65,54.35],['Poznań',16.93,52.41],['Wrocław',17.04,51.11]],
 BR:[['São Paulo',-46.63,-23.55],['Rio de Janeiro',-43.2,-22.9],['Brasília',-47.88,-15.79],['Manaus',-60.02,-3.12],['Salvador',-38.5,-12.97],['Recife',-34.88,-8.05]],
 AR:[['Buenos Aires',-58.38,-34.6],['Córdoba',-64.18,-31.42],['Mendoza',-68.83,-32.89],['Rosario',-60.65,-32.95],['Salta',-65.41,-24.78]],
 ID:[['Jakarta',106.85,-6.21],['Surabaya',112.75,-7.25],['Medan',98.67,3.59],['Makassar',119.43,-5.15],['Balikpapan',116.83,-1.24]],
 NG:[['Lagos',3.38,6.52],['Abuja',7.49,9.06],['Kano',8.52,12.0],['Ibadan',3.9,7.38],['Port Harcourt',7.03,4.82]],
 VN:[['Hà Nội',105.85,21.03],['TP HCM',106.63,10.82],['Đà Nẵng',108.2,16.05],['Hải Phòng',106.68,20.86]],
 UA:[['Kyiv',30.52,50.45],['Lviv',24.03,49.84],['Odesa',30.72,46.48],['Kharkiv',36.23,49.99],['Dnipro',35.04,48.46]],
 FR:[['Paris',2.35,48.86],['Lyon',4.84,45.76],['Marseille',5.37,43.3],['Bordeaux',-0.58,44.84],['Lille',3.06,50.63]],
 DE:[['Berlin',13.4,52.52],['München',11.58,48.14],['Hamburg',9.99,53.55],['Köln',6.96,50.94],['Frankfurt',8.68,50.11]],
 IT:[['Roma',12.5,41.9],['Milano',9.19,45.46],['Napoli',14.27,40.85],['Torino',7.69,45.07],['Palermo',13.36,38.12]],
 JP:[['Tokyo',139.69,35.69],['Osaka',135.5,34.69],['Sapporo',141.35,43.06],['Fukuoka',130.4,33.59],['Nagoya',136.9,35.18]],
 US:[['New York',-74.0,40.71],['Los Angeles',-118.24,34.05],['Chicago',-87.63,41.88],['Houston',-95.37,29.76],['Miami',-80.19,25.76]],
 GB:[['London',-0.13,51.51],['Manchester',-2.24,53.48],['Glasgow',-4.25,55.86],['Birmingham',-1.9,52.49]],
 MX:[['CDMX',-99.13,19.43],['Guadalajara',-103.35,20.66],['Monterrey',-100.31,25.69],['Puebla',-98.2,19.04]],
 ES:[['Madrid',-3.7,40.42],['Barcelona',2.17,41.39],['Valencia',-0.38,39.47],['Sevilla',-5.98,37.39]],
 RU:[['Москва',37.62,55.75],['Санкт-Петербург',30.32,59.94],['Новосибирск',82.93,55.03],['Екатеринбург',60.6,56.84]]
};
var FLAG_LIB=null;
function loadFlagLib(){
 var url='https://cdn.jsdelivr.net/npm/country-flag-icons@1.5.13/string/3x2/+esm';
 return Promise.race([import(url),new Promise(function(_,rej){setTimeout(function(){rej('timeout')},8000)})]).then(function(m){FLAG_LIB=m},function(){FLAG_LIB=null});
}
function flagColors(svg){
 var cols=[],re=/fill="(#[0-9A-Fa-f]{3,6})"/g,m;
 while((m=re.exec(svg))){var h=m[1];if(h.length===4)h='#'+h[1]+h[1]+h[2]+h[2]+h[3]+h[3];h=h.toUpperCase();if(cols.indexOf(h)<0)cols.push(h)}
 function sat(h){var c=parseInt(h.slice(1),16),r=c>>16,g=c>>8&255,b=c&255;return Math.max(r,g,b)-Math.min(r,g,b)}
 var vivid=cols.filter(function(h){return sat(h)>70});
 var c1=vivid[0]||cols.find(function(h){return h!=='#FFFFFF'})||'#6B6A55';
 var c2=cols.find(function(h){return h!==c1})||'#FFFFFF';
 return [c1,c2];
}
/* C[code] = {k3, geo, lg, pl, s, r, c1, c2} for every playable country found on the map */
var C={},CODES=[],GEO2C={};
function buildCountries(world){
 var have={};(world?world.features:[]).forEach(function(f){have[f.properties.name]=1});
 var lgOf={};LEAGUE_LISTS.forEach(function(s,i){s.split(' ').forEach(function(c){lgOf[c]=i})});
 GEO_TABLE.split('|').forEach(function(row){
  var p=row.split(':'),geo=p[0],c=p[1],k3=p[2];if(world&&!have[geo])return;
  var lg=lgOf[c]==null?4:lgOf[c],R=rng(c.charCodeAt(0)*131+c.charCodeAt(1)*7),pl,s,r;
  if(HAND[c]){pl=HAND[c][0];s=HAND[c][1];r=HAND[c][2]}
  else{var rg=[[65000,150000],null,[14000,30000],[3000,12000],[200,2800]][lg];pl=Math.round(rg[0]+(rg[1]-rg[0])*Math.pow(R(),1.4));s=Math.round(pl*6.4*(.9+R()*.2));r=s/34000}
  var cols=['#6B6A55','#FFFFFF'];if(FLAG_LIB&&FLAG_LIB[c])cols=flagColors(FLAG_LIB[c]);else if(FLAG[c])cols=flagColors(FLAG[c]);
  C[c]={k3:k3,geo:geo,lg:lg,pl:pl,s:s,r:r,c1:cols[0],c2:cols[1]};CODES.push(c);GEO2C[geo]=c;
 });
}
