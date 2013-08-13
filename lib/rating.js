
module.exports = function(query) {
  query.method('rate', function(id, rating) {
    this.req({
      method: 'POST',
      route: 'videos/rate',
      data: {
        id: id,
        rating: rating
      }
    });
  });

  query.method('like', function(id) {
    this.rate(id, 'like');
  });

  query.method('removeRating', function(id) {
    this.rate(id, 'none');
  });

  query.method('dislike', function(id) {
    this.rate(id, 'dislike');
  });
};
