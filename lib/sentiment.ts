export function analyzeSentiment(reviews: string[]) {

  let positive = 0;
  let negative = 0;

  const positiveWords = [
    "great","good","amazing","excellent","love","masterpiece"
  ];

  const negativeWords = [
    "bad","boring","terrible","awful","waste","poor"
  ];

  reviews.forEach(review => {

    const text = review.toLowerCase();

    positiveWords.forEach(word=>{
      if(text.includes(word)) positive++;
    });

    negativeWords.forEach(word=>{
      if(text.includes(word)) negative++;
    });

  });

  let sentiment = "Mixed";

  if(positive > negative) sentiment = "Positive";
  if(negative > positive) sentiment = "Negative";

  return {
    sentiment,
    positive,
    negative
  };

}