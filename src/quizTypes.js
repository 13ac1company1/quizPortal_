/**
 * @typedef {{a:string,b:string,c:string,d:string}} ChoiceMap
 * @typedef {{id:string,q:string,choices:ChoiceMap,answer:'a'|'b'|'c'|'d'}} Question
 * @typedef {{week:number,title:string,questions:Question[]}} Week
 * @typedef {{subject:string,weeks:Week[]}} SubjectData
 */
export {};