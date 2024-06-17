// form to upload an image to s3
// input: name, Key (hidden), Image
// need to use js to combine name with current prefix (folder) to generate Key
// server takes in {Key} from body, and Image from file input
const uploadFormHtml = `
      <!--upload form-->
          <div id="upload-form-container" class="container mb-5">
          <select id='prefix-select' class="form-select" aria-label="prefix-select">
          </select>
          <div id='images-container-div'></div>
          <div class='mt-4 bg-primary p-3 rounded shadow'>
          <p class='text-white'>Upload Image</p>
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
                  <button id="upload" class="btn btn-light w-100">
                    Upload
                  </button>
                </div>
              </div>
            </form>
            </div>
          </div>`

export default uploadFormHtml