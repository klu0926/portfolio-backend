const metaInput = `
<div class="meta-input input-group mb-3">
  <span class="input-group-text">key</span>
  <select class="form-select meta-key">
    <option>Choose...</option>
    <option value="website">Website</option>
    <option value="github">Github</option>
    <option value="medium">Medium</option>
    <option value="video">Video</option>
  </select>
  <span class="input-group-text">value</span>
  <input
    type="text"
    class="form-control meta-value"
    placeholder="value"
    aria-label="meta-value"
  />
  <button class="meta-delete btn btn-outline-danger" type="button" i>X</button>
</div>
`

export default metaInput