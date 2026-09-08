// ===== EDIT THIS FILE ONLY to personalise the invitation =====
window.WEDDING = {
  // Kuldevi / deity names shown under the Ganesh shloka at the top of the invitation
  deities: ["શ્રી ચામુંડા માતાજી", "શ્રી ખોડિયાર માતાજી", "શ્રી મેલડી માતાજી"],
  // Guest line "પ્રતિ, ..." at the top of the invitation.
  // Per-guest: share the link as  index.html?to=શ્રી પટેલ પરિવાર
  // guestDefault is shown when the link has no ?to= (leave "" to hide the line).
  guestDefault: "",
  guestPrefix: "શ્રી/શ્રીમતી",   // respectful title before every guest name (skipped if the name already starts with શ્રી)
  guestSuffix: "તથા સર્વો",           // appended after every guest name
  groom: "હાર્દિક",
  bride: "અંજના",
  groomParents: "શ્રી ખીમજીભાઈ તથા શ્રીમતી રેખાબેન બારૈયા ના સુપુત્ર",
  brideParents: "શ્રી રાજુભાઈ તથા શ્રીમતી વર્ષાબેન રાઠોડ ના સુપુત્રી",
  groomFrom: "મૂળ ગામ: દેવળીયા",        // TODO e.g. "મૂળ ગામ: સિહોર, જિ. ભાવનગર"
  groomFamily: "બારૈયા પરિવાર",
  brideFrom: "મૂળ ગામ: જસમતપુર",        // TODO bride side village / town
  brideFamily: "રાઠોડ પરિવાર",
  // ISO date-time of the main wedding ceremony (used for countdown + calendar)
  dateTime: "2026-12-13T19:00:00+05:30",          // TODO: confirm muhurat time
  dateText: "તા. ૧૩ ડિસેમ્બર ૨૦૨૬, રવિવાર",
  tithi: "વિ.સં. ૨૦૮૩, માગશર સુદ",                // TODO: confirm exact tithi from panchang
  muhurat: "હસ્તમેળાપ: બપોરે ૧૨:૦૦ કલાકે",           // TODO: confirm
  // Traditional invitation verse shown after the main invite (one line per entry)
  verse: [
    "સ્નેહના તાંતણે બંધાયાં બે હૈયાં,",
    "વડીલોના આશિષથી શોભે આ મંગલ અવસર;",
    "આપનાં પગલાંથી પાવન થાય અમારું આંગણું,",
    "એ જ અભિલાષા સહ ભાવભર્યું આમંત્રણ."
  ],
  inviter: "નિમંત્રક: બારૈયા પરિવાર, સિહોર",     // TODO: confirm village / town
  venueTitle: "શુભ સ્થળ",
  venue: {
    name: "શુભ સ્થળ",
    address: "સિહોર, જિ. ભાવનગર, ગુજરાત",
    mapsUrl: "https://www.google.com/maps?q=21.727565,71.976484"
  },
  whatsapp: "917041989011", // TODO: country code + number, digits only
  events: [
    { name: "ગણેશ સ્થાપના", date: "તા. ૧૧ ડિસેમ્બર ૨૦૨૬, શુક્રવાર", time: "સવારે ૯:૦૦ કલાકે", icon: "om", note: "શુભ કાર્યની મંગલ શરૂઆત" },
    { name: "પીઠી", date: "તા. ૧૧ ડિસેમ્બર ૨૦૨૬, શુક્રવાર", time: "સાંજે ૯:૦૦ કલાકે", icon: "flower", note: "પીળા વસ્ત્રોમાં પધારવા વિનંતી" },
    { name: "મંડપ મુહૂર્ત", date: "તા. ૧૨ ડિસેમ્બર ૨૦૨૬, શનિવાર", time: "સવારે ૯:૦૦ કલાકે", icon: "mandap", note: "મંડપ રોપણ વિધિ" },
    { name: "સ્નેહભોજન", date: "તા. ૧૨ ડિસેમ્બર ૨૦૨૬, શનિવાર", time: "બપોરે ૧૨:૩૦ કલાકે", icon: "thali", note: "આપ સૌ સહકુટુંબ ભોજન લેવા પધારશો" },
    { name: "જાન પ્રસ્થાન", date: "તા. ૧૩ ડિસેમ્બર ૨૦૨૬, રવિવાર", time: "સવારે ૯:૦૦ કલાકે", icon: "dhol", note: "વરરાજાની જાન" },
    { name: "હસ્તમેળાપ", date: "તા. ૧૩ ડિસેમ્બર ૨૦૨૬, રવિવાર", time: "બપોરે ૧૨:૦૦ કલાકે", icon: "rings", note: "લગ્નવિધિ, સપ્તપદી અને આશીર્વાદ" },
    { name: "સ્વાગત સમારંભ", date: "તા. ૧૩ ડિસેમ્બર ૨૦૨૬, રવિવાર", time: "સાંજે ૬:૦૦ કલાકે", icon: "kalash", note: "નવદંપતીને આશીર્વાદ આપવા પધારશો" }
  ],
  // icon names available: om, flower, mandap, thali, dhol, rings, kalash
  // Splash quote (groom side). Bride side has its own below.
  splashQuote: "શ્રી ગણેશજી તથા અમારા કુળદેવી શ્રી ચામુંડા માતા ની કૃપાથી અમારા આંગણે લગ્નનો માંગલિક પ્રસંગ આવ્યો છે.<br>આ શુભ અવસરે આપ સૌને પધારવા હૃદયપૂર્વક નિમંત્રણ.",

  // ===== BRIDE SIDE (કન્યા પક્ષ) =====
  // Opened with  index.html?side=bride   — anything here overrides the groom-side value above.
  bride_side: {
    deities: ["॥ શ્રી ચામુંડા માતાજી ॥", "॥ શ્રી ખોડિયાર માતાજી ॥", "॥ શ્રી મેલડી માતાજી ॥"],   // TODO: bride's kuldevi
    splashQuote: "શ્રી ગણેશજી તથા અમારા કુળદેવીની કૃપાથી અમારા આંગણે લગ્નનો માંગલિક પ્રસંગ આવ્યો છે.<br>આ શુભ અવસરે આપ સૌને પધારવા હૃદયપૂર્વક નિમંત્રણ.",
    inviter: "નિમંત્રક: રાઠોડ પરિવાર, સિહોર",      // TODO: bride's village / town
    venueTitle: "લગ્ન સ્થળ",
    venue: {
      name: "લગ્ન સ્થળ",                              // TODO: bride-side venue (if different)
      address: "સિહોર, જિ. ભાવનગર, ગુજરાત",
      mapsUrl: "https://www.google.com/maps?q=21.73121455143081,71.977565757211"
    },
    whatsapp: "919999999999",                          // TODO: bride-side RSVP number
    events: [                                          // TODO: confirm bride-side programme
      { name: "ગણેશ સ્થાપન", date: "તા. ૧૧ ડિસેમ્બર ૨૦૨૬, શુક્રવાર", time: "સવારે ૯:૦૦ કલાકે", icon: "om", note: "શુભ કાર્યની મંગલ શરૂઆત" },
      { name: "મહેંદી", date: "તા. ૧૧ ડિસેમ્બર ૨૦૨૬, શુક્રવાર", time: "સાંજે ૪:૦૦ કલાકે", icon: "flower", note: "મહેંદીની રંગત" },      
      { name: "મંડપ મુહૂર્ત", date: "તા. ૧૨ ડિસેમ્બર ૨૦૨૬, શનિવાર", time: "સવારે ૯:૦૦ કલાકે", icon: "mandap", note: "મંડપ રોપણ વિધિ" },      
      { name: "પીઠી", date: "તા. ૧૨ ડિસેમ્બર ૨૦૨૬, શનિવાર", time: "સાંજે ૯:૦૦ કલાકે", icon: "flower", note: "પીળા વસ્ત્રોમાં પધારવા વિનંતી" },
      { name: "જાન સ્વાગત", date: "તા. ૧૩ ડિસેમ્બર ૨૦૨૬, રવિવાર", time: "બપોરે ૧૧:૦૦", icon: "dhol", note: "વરરાજાની જાનનું સ્વાગત" },
      { name: "હસ્તમેળાપ", date: "તા. ૧૩ ડિસેમ્બર ૨૦૨૬, રવિવાર", time: "બપોરે ૧૨:૦૦ કલાકે", icon: "rings", note: "લગ્નવિધિ, સપ્તપદી અને આશીર્વાદ" }
    ]
  },

  ganeshaModel: "assets/ganesha.glb"
};
