export function recapAnswers(fields, getAnswer) {
  return fields.flatMap((field) => {
    const answer = getAnswer(field)?.trim();
    return answer ? [{ question: field.prompt ?? field.label, answer }] : [];
  });
}
