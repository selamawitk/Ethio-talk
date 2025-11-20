const replies = {
  health: [
    {
      text: 'ራስን መተማመን መገንባት ትንንሽ እና ቀጣይነት ያላቸው እርምጃዎችን ይፈልጋል። በራስህ እመን፣ ብዙ ጊዜ ተለማመድ፣ እና እያንዳንዱን ትንሽ ስኬት አክብር።',
      category: 'Self Development'
    }
  ]
};

export function getRandomReply(intent) {
  const intentReplies = replies[intent];
  if (!intentReplies || intentReplies.length === 0) {
    console.error(`No replies found for intent: ${intent}. Falling back to 'general'.`);
    return { text: 'Sorry, I have no reply for this right now.', category: 'General' };
  }
  return intentReplies[0]; 
}
