import sweetImagesSelect from '../../htmlTemplates/sweetImagesSelect.js'

const sweetAlert = {
  didRenderHandlers: {}, // for write controller to set up later
  success: (title, text, timer) => {
    return new Promise((resolve, reject) => {
      Swal.fire({
        title: title || "Success!",
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
        title: title || "Success!",
        icon: icon || "info",
        text: text || '',
        confirmButtonText: 'OK',
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
        confirmButtonText: 'Yes',
        confirmButtonColor: '#3894F1',
        denyButtonText: 'No',
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
        title: title || 'Fail',
        icon: "error",
        text: text || '',
        confirmButtonText: 'OK',
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
        confirmButtonText: 'OK',
        confirmButtonColor: '#3894F1',
        showDenyButton: true,
        denyButtonText: 'Deny',
        denyButtonColor: '#F7647D',
        showCancelButton: true,
        cancelButtonText: 'Cancel',
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
      cancelButtonText: 'Close',
      imageWidth: size || '320px',
      background: `#fff`,
      imageUrl: url,
    })
  },
  loading: (loadTitle) => {
    Swal.fire({
      title: loadTitle || "Loading...",
      html: `<div class='swal-loading-bar'></div>`,
      showConfirmButton: false,
      allowOutsideClick: false,
      customClass: {
        title: 'swal-loading-title',
        popup: 'swal-loading-popup',
        text: 'swal-loading-text'
      }
    })
    // return a close now function
    return sweetAlert.closeNow
  },
  // sync 
  closeNow: () => {
    const alert = document.querySelector('.swal2-container')
    if (alert) {
      swal.close()
    }
  },
  // timeout
  close: (timer = 0) => {
    setTimeout(() => {
      const alert = document.querySelector('.swal2-container')
      if (alert) {
        swal.close()
      }
    }, timer)
  },
  // didRenderHandler will run in didRender()
  showImageSelection(urls) {
    if (!Array.isArray(urls) || urls.length === 0) {
      sweetAlert.error('Error', 'Missing images urls')
      return;
    }
    // main template
    let sweetImagesSelectDiv = document.createElement('div')
    sweetImagesSelectDiv.classList.add('mt-2')
    sweetImagesSelectDiv.innerHTML = sweetImagesSelect

    Swal.fire({
      title: 'Images',
      html: sweetImagesSelectDiv,
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'image-grid-popup',
      },
      didRender: () => {
        this.didRenderHandlers.SweetImageSelectionDidRender()
      }
    });
  }
}

export default sweetAlert