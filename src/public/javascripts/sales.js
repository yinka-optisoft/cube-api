// get current date
var inDate = new Date();
var invoiceDates = `${inDate.getMonth() + 1 } /${ inDate.getDate() }/${ inDate.getFullYear()}`;

// generate invoice number
function genInvoiceNumb() {
  var text = '';
  // var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var possible = '0123456789';
  // var possible = new Date().format('mdhi');

  for (var i = 0; i < 8; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  // text += possible;

  return text;
}
// var invoiceNumber = new Date().format('m-d-Y/h:i:s');
// $('#invoiceNumber').val('INVOP-'+invoiceNumber+'-'+genInvoiceNumb());
// $('#invoiceNumber').val(genInvoiceNumb());

// generate waybill number
function genWayBilNumb() {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 11; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
$('#waybillNumber').val(genWayBilNumb());


// get product pieces thought barcode number
function getBarcode(id) {

  $.ajax({
    type: 'POST',
    url: '/sales/get/barcodeNumber',
    dataType: 'json',
    data: { barcodeNumber: id },
    success: function(data) {

      $('#submitBtn').removeAttr('disabled');

      if (data === 'failure') {

        var msg = '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                            '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span>' +
                            '</button>' +
                            'Invalid Barcode';
        '</div>';

        $('.barMsg').html(msg);
        $('.barMsg').show().fadeOut(10000);

        $('#piecesSold').attr('disabled', 'disabled');
        $('#productPrice').attr('disabled', 'disabled');
        $('#submitBtn').attr('disabled', 'disabled');


        // enable product name field
        $('#_productName').val('').removeAttr('disabled');
        $('#piecesSold').val('').removeAttr('disabled');
        $('#productPrice').val('').removeAttr('disabled');
        $('#piecesAvai').val('');
        $('#getPrice').val('');

      } else {

        $('#_productName').empty();
        $('#_productName').val(data._productId.productName).attr('disabled', 'disabled');
        $('#productNameId').val(data._productId._id);
        $('#_productId').val(data._productId._id);

        // check if product is empty
        /* if (data.pieces < 1) {

          var msg = '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                            '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span>' +
                            '</button>' +
                            'Product Unavailable';
          '</div>';

          $('.piecesMsg').append(msg);
          $('.piecesMsg').show().fadeOut(10000);

          $('#piecesSold').attr('disabled', 'disabled');
          $('#productPrice').attr('disabled', 'disabled');

          $('#piecesAvai').empty();
          $('#piecesAvai').val(0);

          $('#getPrice').empty();
          $('#getPrice').val(0);
        } else {*/

        $('#piecesSold').removeAttr('disabled');
        $('#productPrice').removeAttr('disabled');

        $('#piecesAvai').empty();
        $('#piecesAvai').val(data.pieces);

        $('#getPrice').empty();
        $('#getPrice').val(data._productId.sellingPrice);
        // }
      }
    },
    error: function(jqXHR, textStatus, errorThrow) {
      $.alert(errorThrow);
    }
  });
}


function getPieces(id) {
  var productId = id;

  $.ajax({
    type: 'POST',
    url: '/sales/get/pieces',
    dataType: 'json',
    data: { _productId: productId },
    success: function(data) {
      /* if (data.pieces < 1) {

        var msg = '<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span>' +
                        '</button>' +
                        'Product Unavailable';
        '</div>';

        // $('.piecesMsg').append(msg);
        $('.piecesMsg').html(msg);
        $('.piecesMsg').show().fadeOut(10000);

        $('#piecesSold').attr('disabled', 'disabled');
        $('#productPrice').attr('disabled', 'disabled');

        $('#piecesAvai').empty();
        $('#piecesAvai').val(0);

        $('#getPrice').empty();
        $('#getPrice').val(0);
      }*/
      // else {

      $('#piecesSold').removeAttr('disabled');
      $('#productPrice').removeAttr('disabled');

      $('#piecesAvai').empty();
      $('#piecesAvai').val(data.pieces);

      $('#getPrice').empty();
      $('#getPrice').val(data._productId.sellingPrice);

      // }
    },
    error: function(jqXHR, textStatus, errorThrow) {
      $.alert(errorThrow);
    }
  });
}


function enterPieces(pieces) {

  var available = $('#piecesAvai').val();
  var piecesSold = pieces;
  var sub = (parseFloat(available) - parseFloat(piecesSold));

  $('#piecesAvai').val(sub);
}


function pricePay(price) {
  var initPrice = price;
  var presentPrice = $('#getPrice').val();

  if (parseFloat(initPrice) < parseFloat(presentPrice)) {
    var msg = `${'<div class="alert alert-danger alert-dismissible fade in" role="alert">' +
                        '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">×</span>' +
                        '</button>' +
                        'You can\'t sell below '}${ presentPrice
    }</div>`;

    $('#productPrice').val(0);
  } else {
    var msg = '';
  }

  // $('.getMsg').append(msg);
  $('.getMsg').html(msg);
  $('.getMsg').show().fadeOut(10000);
}


$('#updateSales').on('show.bs.modal', function(e) {

  var opener = e.relatedTarget; // Button that triggered the modal

  var productId = $(opener).attr('productId'); // Extract info from data-* attributes
  var pieces = $(opener).attr('pieces');
  var price = $(opener).attr('price');

  // $('#editSaleProduct').find('[name="_productId"]').val(productId);
  $('#editSaleProduct').find('[name="_uproductId"]').val(productId);
  $('#editSaleProduct').find('[name="pieces"]').val(pieces);
  $('#editSaleProduct').find('[name="price"]').val(price);

});

function getDiscount(e) {

  if (e < 0) {
    $('#discount').val(0);
    return false;
  }

  var sum = $('#sumAmt').val();
  var totalDiscount = (sum - e);
  $('#amtDueToCus').val(totalDiscount);
  $('#balanceTransaction').val(totalDiscount);
}

function amountPaidByCus(e) {
  var amtDueToCus = $('#amtDueToCus').val();
  var totalDiscount = (e - amtDueToCus);
  $('#balanceTransaction').val(totalDiscount);
}


var salesArray = [];
var salesObj = { };

function checkexist() {
  var inArray = -1;
  for (var k = 0; k < salesArray.length; ++k) {
    if ($('#_productId').val() === salesArray[k]._productId)
      inArray = k;
  }


  if (inArray > -1) {

    console.log('come when tru');

    salesArray[inArray].piecesSold = parseFloat(salesArray[inArray].piecesSold) + parseFloat($('#piecesSold').val());
    salesArray[inArray].productTotalPrice = parseFloat(salesArray[inArray].piecesSold) * parseFloat(salesArray[inArray].productTotalPrice);

    console.log(salesArray, 'if inArray is tru');

    tableAppend();

  } else {

    var salesObj = { };

    console.log(salesArray, 'when inArray is false');
    console.log('create new one');

    // var p = $('#saleProduct').find(':selected').attr('data-productName');

    salesObj['_productId'] = $('#_productId').val();
    salesObj['productName'] = $('#_productName').val();
    salesObj['piecesSold'] = $('#piecesSold').val();
    salesObj['productPrice'] = $('#productPrice').val();
    salesObj['productTotalPrice'] = parseFloat($('#productPrice').val()) * parseFloat(salesObj['piecesSold']);

    salesArray.push(salesObj);
    salesObj = { };

    tableAppend();

  }

}

$('#saleProduct').submit(function(e) {

  e.preventDefault();

  pieces = $('#piecesSold').val();
  proPrice = $('#productPrice').val();
  proName = $('#_productName').val();

  if (proName === '' || pieces === '' || proPrice === '') {
    alert('Select Product Or Enter Pieces Sold Or Product Price');
    return false;
  }

  if (salesArray.length > 0) {
    console.log('enter');
    checkexist();

  } else {

    console.log('create if zero');

    salesObj['_productId'] = $('#_productId').val();
    salesObj['productName'] = $('#_productName').val();
    salesObj['piecesSold'] = $('#piecesSold').val();
    salesObj['productPrice'] = $('#productPrice').val();
    salesObj['productTotalPrice'] = $('#productPrice').val() * salesObj['piecesSold'];
    salesArray.push(salesObj);
    salesObj = { };

    console.log(salesArray);

    $('#saleProduct')[0].reset();

    tableAppend();

  }

  // remove disable attribute in product name form after submitting sales
  $('#_productName').removeAttr('disabled');

});


function tableAppend() {
  var totalCal = [];
  $('#saleTable').empty();
  for (var i = 0, I = salesArray.length; i < I; i++) {

    var cal = (salesArray[i].piecesSold * salesArray[i].productPrice);
    totalCal.push(cal);


    var tr = `${'<tr>' +
                    '<td>'}${ 1 + i }</td>` +
                    `<td>${salesArray[i].productName}</td>` +
                    `<td>${salesArray[i].piecesSold}</td>` +
                    `<td>${salesArray[i].productPrice}</td>` +
                    `<td>${cal}</td>` +
                    '<td>' +
                        /* '<button type="button" productId="'+ salesArray[i]._productId +'" pieces="'+ salesArray[i].piecesSold +'" price="'+ salesArray[i].productPrice +'" data-target="#updateSales"  data-toggle="modal" value="'+ salesArray[i]._productId +'" class="btn btn-success btn-sm">Edit</button>'+*/
                        `<button type="button" value="${ salesArray[i]._productId }" onclick="deleteProduct(this.value)" class="btn btn-danger btn-sm">Delete</button>`+
                        '</td>' +
                '</tr>';

    $('#saleTable').append(tr);
    $('#saleProduct')[0].reset();


    // get sum of all the product on the table
    sumTotalCal = 0;
    subtotal = 0;
    $.each(totalCal, function() { sumTotalCal += parseFloat(this) || 0; });

    subtotal = totalCal;

    // assign sumTotalCal to Sum Amount By Sales and
    // amount due to customer and balance transaction

    $('#sumAmt').val(sumTotalCal);
    $('#amtDueToCus').val(sumTotalCal);
    $('#balanceTransaction').val(sumTotalCal);
  }
}


$('#allSales').submit(function(e) {
  e.preventDefault();

  var dis = $('#discount').val();
  var vat = $('#vat').val();
  var amtDueToCus = $('#amtDueToCus').val();
  var payByCus = $('#payByCus').val();
  var balanceTransaction = $('#balanceTransaction').val();
  var paidBy = $('#_paidBy').val();

  var invoiceDate = invoiceDates;
  var invoiceNumber = $('#invoiceNumber').val();
  var waybillNumber = $('#waybillNumber').val();
  var customerId = $('#_customerId').val();
  var totalPrice = sumTotalCal;

  if (payByCus === '') {
    alert('Enter Amount Customer Give You ');
    return false;
  }

  $.ajax({
    type: 'POST',
    url: '/sales/create/sale',
    dataType: 'json',
    data: {
      salesArray: salesArray,
      discount: dis,
      vat: vat,
      amtDueToCus: amtDueToCus,
      payByCus: payByCus,
      balanceTransaction: balanceTransaction,
      paidBy: paidBy,
      invoiceDate: invoiceDate,
      invoiceNumber: genInvoiceNumb(),
      waybillNumber: waybillNumber,
      customerId: customerId,
      totalPrice: totalPrice,

      // TODO: This is get from append table
      subtotal: subtotal
    }
  }).done(function(data) {
    // console.log(data);
    $('#salesSuccess').modal('show');

    // console.log(data._id, 'for data');

    // var temp=$('a').attr('href').split('=')[0];
    // $('a').attr('href',temp+'='+data._id);
    $('a#salesId').attr('href', `/sales/get/pdf/${data._id}`);
  });
});

function closeSales() {
  location.reload();
}

// remove product from array
function deleteProduct(id) {

  var sum = $('#sumAmt').val();

  for (var i = 0; i < salesArray.length; i++) {
    if (id === salesArray[i]._productId) {
      var deductSum = parseFloat(sum - salesArray[i].productPrice);
      salesArray.splice(i, 1);
    }
  }

  $('#sumAmt').val(deductSum);
  tableAppend();
}

$('.salesArrayUpdate').click(function(e) {
  e.preventDefault();

  var productId = $('#_uproductId').val();
  var piecesSold = $('#epiecesSold').val();
  var productPrice = $('#eproductPrice').val();

  for (var i = 0; i < salesArray.length; i++) {
    if (productId === salesArray[i]._productId) {
      salesArray[i].piecesSold = piecesSold;
      salesArray[i].productPrice = productPrice;
    }
  }

  $('#updateSales').modal('hide');

  tableAppend();
});


$(function() {

  function log(message) {
    $('<div>').text(message).prependTo('#log');
    $('#log').scrollTop(0);
  }

  $('#_productName').autocomplete({

    source: function(request, response) {
      // console.log(request.term);
      $.ajax({
        url: `/sales/get/product/${  request.term}`,
        type: 'GET',
        dataType: 'json',
        data: {
          q: request.term
        },
        success: function(data) {
          // console.log(data);
          response(data.map(function(value) {
            return {
              label: value.productName,
              value: value.productName,
              value1: value._id,
            };
          }));
        }
      });
    },
    minLength: 2,
    select: function(event, ui) {

      // pass id to getPieces function
      getPieces(ui.item.value1);

      $('#_productId').val(ui.item.value1);

      // log( ui.item ?
      // "Selected: " + ui.item.value1 :
      // "Nothing selected, input was " + this.value);
    },
    open: function() {
      $(this).removeClass('ui-corner-all').addClass('ui-corner-top');
    },
    close: function() {
      $(this).removeClass('ui-corner-top').addClass('ui-corner-all');
    }
  });
});
