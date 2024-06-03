const sweetAlert = {
  success: (title, text, timer) => {
    return new Promise((resolve, reject) => {
      Swal.fire({
        title: title || "成功",
        icon: "success",
        text: text || '',
        showConfirmButton: false,
        timer: timer || 1500,
        customClass: {
          title: 'swal-title',
        }
      }).then(result => {
        return resolve(result)
      })
    })
  },
  notice: (title, icon, text) => {
    return new Promise((resolve, reject) => {
      Swal.fire({
        title: title || "成功",
        icon: icon || "info",
        text: text || '',
        confirmButtonText: '是的',
        confirmButtonColor: '#3894F1',
        customClass: {
          title: 'swal-title',
        }
      }).then(result => {
        return resolve(result)
      })
    })
  },
  confirm: (title, text) => {
    return new Promise((resolve, reject) => {
      Swal.fire({
        title: title,
        text: text || '',
        showDenyButton: true,
        confirmButtonText: '是的',
        confirmButtonColor: '#3894F1',
        denyButtonText: '不要',
        denyButtonColor: '#F7647D',
        customClass: {
          title: 'swal-title',
        }
      }).then(result => {
        return resolve(result)
      })
    })
  },
  error: (title, text) => {
    return new Promise((resolve, reject) => {
      Swal.fire({
        title: title || '失敗',
        icon: "error",
        text: text || '',
        confirmButtonText: '好吧',
        confirmButtonColor: '#F7647D',
        customClass: {
          title: 'swal-title',
        }
      }).then(result => {
        return resolve(result)
      })
    })
  },
  editTagInput: (title, inputValue, placeholder, inputType) => {
    return new Promise(async (resolve, reject) => {
      const result = await Swal.fire({
        title: title || 'title',
        input: inputType || "text",
        inputPlaceholder: placeholder,
        inputValue,
        confirmButtonText: '修改',
        confirmButtonColor: '#3894F1',
        showDenyButton: true,
        denyButtonText: '刪除',
        denyButtonColor: '#F7647D',
        showCancelButton: true,
        cancelButtonText: '取消',
        inputAttributes: {
          "aria-label": "Type your input here"
        },
        customClass: {
          title: 'swal-title',
        }
      })
      resolve(result)
    })
  },
  image: (url, size) => {
    Swal.fire({
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: '關閉',
      imageWidth: size || '320px',
      background: `#fff`,
      imageUrl: url,
    })
  },
  loading: (loadTitle) => {
    return new Promise((resolve, reject) => {
      Swal.fire({
        title: loadTitle || "努力中...",
        html: `<div class='swal-loading-bar'></div>`,
        showConfirmButton: false,
        allowOutsideClick: false,
        customClass: {
          title: 'swal-loading-title',
          popup: 'swal-loading-popup',
          text: 'swal-loading-text'
        }
      }).then(result => {
        return resolve(result)
      })
    })
  },
  close: (timer = 0) => {
    setTimeout(() => {
      const alert = document.querySelector('.swal2-container')
      if (alert) {
        swal.close()
      }
    }, timer)
  },
  showImageSelection(urls, insertImageHandler) {
    if (!Array.isArray(urls) || urls.length === 0) {
      sweetAlert.error('Error', 'Missing images urls')
      return;
    }
    const className = 'image-select'
    const imagesHtml = urls.map(url => {
      const title = url.split('/').pop()
      return (`<img src="${url}" class="${className}" title="${title}">`)
    }
    ).join('');

    Swal.fire({
      title: 'Images',
      html: imagesHtml,
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'image-grid-popup',
      },
      didRender: () => {
        // add callback function to each button
        const images = document.querySelectorAll(`.${className}`)
        console.log('images:', images)
        images.forEach(image => image.onclick = () => {
          insertImageHandler(image.src)
          // close
          sweetAlert.close()
        })
      }
    });
  }

}

export default sweetAlert