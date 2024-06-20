const gridInputId= 'grid-input'
const imageContainerGridButtonsDiv = `
<div class='row'>

<div class="col"></div>

<div class="col input-group">
  <span class="input-group-text" id="basic-addon2">Row</span>
  <input id=${gridInputId} type="text" class="form-control image-container-grid-input" value="1" aria-label="grid input">
</div>

<div class="col"></div>
</div>
`

// form to upload an image to s3
// input: name, Key (hidden), Image
// need to use js to combine name with current prefix (folder) to generate Key
// server takes in {Key} from body, and Image from file input
const uploadFormHtml = `
      <!--upload form-->
          <div id="upload-form-container" class="container">
          <select id='prefix-select' class="form-select" aria-label="prefix-select">
          </select>
          <div id='images-container-div'></div>
                ${imageContainerGridButtonsDiv}
          <div class='mt-4 bg-gray p-3 rounded'>
            <form
              id="upload-form"
              method="post"
              action="/objects"
              enctype="multipart/form-data"
            >
              <div class="row g-3 align-items-center">
                <div class="col-6">
                  <input
                    name="name"
                    id="name-input"
                    type="text"
                    class="col-auto form-control"
                    placeholder="file name"
                    required
                  />
                  <input
                    name="Key"
                    id="key-input"
                    type="text"
                    class="col-auto form-control"
                    placeholder="Key"
                    hidden
                  />
                </div>
                <div class="col-6">
                  <input
                    name="Image"
                    id="file-input"
                    type="file"
                    class="col-auto form-control"
                    required
                  />
                </div>
                <div class="col mt-3">
                  <button id="upload" class="btn btn-primary w-100">
                    <i class="fa-solid fa-arrow-up-from-bracket"></i>
                  </button>
                </div>
              </div>
            </form>
            </div>
          </div>`

export default uploadFormHtml