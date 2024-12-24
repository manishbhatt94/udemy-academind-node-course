(function () {
  document.addEventListener('DOMContentLoaded', main);

  function main() {
    productDeleteHandler();
  }

  function productDeleteHandler() {
    document.addEventListener('click', function productDeleteButtonHandler(e) {
      const btn = e.target;
      if (btn.dataset.action !== 'delete-product') {
        return;
      }
      e.preventDefault();
      const form = btn.form;
      const data = serializeForm(form);
      sendDeleteRequest(data).then((response) => {
        if (response.success) {
          form.closest('article.card.product-item').remove();
        }
      });
    });

    function sendDeleteRequest(data) {
      const { id, _csrf } = data;
      return fetch(`/admin/product/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'csrf-token': _csrf,
        },
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          return res.json().then((err) => {
            throw new Error(err.message);
          });
        })
        .catch((err) => {
          console.error(err.message);
        });
    }
  }

  function serializeForm(form) {
    const formData = new FormData(form);
    const data = {};
    formData.forEach((value, key) => {
      data[key] = value;
    });
    return data;
  }
})();
