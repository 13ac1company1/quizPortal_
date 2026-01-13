// Utilities to export/import/clear localStorage records for a subject
export function exportSubjectPayload(subject){
  var payload = { subject: subject, items: [] };
  try{
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (!k) continue;
      if (k.indexOf("quiz:"+subject+":") === 0 ||
          k.indexOf("quizResult:"+subject+":") === 0 ||
          k.indexOf("quizHistory:"+subject+":") === 0) {
        payload.items.push({ key: k, value: localStorage.getItem(k) });
      }
    }
  }catch(e){}
  return payload;
}

export function importSubjectPayload(payload, subject){
  if (!payload || !Array.isArray(payload.items)) throw new Error("Invalid payload");
  for (var i = 0; i < payload.items.length; i++) {
    var it = payload.items[i];
    if (!it || !it.key) continue;
    if (it.key.indexOf("quiz:"+subject+":") === 0 ||
        it.key.indexOf("quizResult:"+subject+":") === 0 ||
        it.key.indexOf("quizHistory:"+subject+":") === 0) {
      try { localStorage.setItem(it.key, it.value); } catch(e){}
    }
  }
}

export function clearSubject(subject){
  var toDelete = [];
  for (var i = 0; i < localStorage.length; i++) {
    var k = localStorage.key(i);
    if (!k) continue;
    if (k.indexOf("quiz:"+subject+":") === 0 ||
        k.indexOf("quizResult:"+subject+":") === 0 ||
        k.indexOf("quizHistory:"+subject+":") === 0) {
      toDelete.push(k);
    }
  }
  for (var j = 0; j < toDelete.length; j++) {
    try { localStorage.removeItem(toDelete[j]); } catch(e){}
  }
  return toDelete.length;
}
