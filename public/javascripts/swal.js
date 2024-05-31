// bucket html import swal script and css
const swal = {
  error: () => {
    return Swal.fire({
      title: 'Error!',
      text: 'Do you want to continue',
      icon: 'error',
      confirmButtonText: 'Cool'
    })
  }
}


export default swal