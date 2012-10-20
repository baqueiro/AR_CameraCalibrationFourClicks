function evalIt(matrixA, textareaP, textareaL, textareaU) {
  var matrix = parseMatrix(matrixA);
//  if (matrix != false) {
//    if (!isRegular(matrix)) {
//      clearFileds(textareaP, textareaL, textareaU);
//      return false;
//    }
    // matrices gets LU and permutation matrices
    //var matrices = decomposeLU(matrix);
    //textareaP.value = matr2str(matrices['P']);
    //textareaL.value = matr2str(matrices['L']);
    //textareaU.value = matr2str(matrices['U']);
    // var m = A.length;      // m rows 3
    //var n = A[0].length;  //  n cols 2
        var A=matrixsimpel(matrix,matrix.length,matrix[0].length);
        var V=matrixsimpel(matrix,matrix[0].length,matrix[0].length);
        var W2=matrixsimpel(matrix,matrix.length,matrix[0].length);     
        var matrices=svdcmp(A,W2,V);
        var temp = matrices['A'];
    textareaP.value = matr2str(matrixfract(temp,temp.length,temp[0].length));
        var temp = matrices['V'];
    textareaL.value = matr2str(matrixfract(temp,temp[0].length,temp[0].length));
        var temp = matrices['W2'];
    textareaU.value = matr2str(matrixfract(temp,temp.length,temp[0].length));
//  }
}

function checkIt(matrixA, permut_matrix, matrixL, matrixU) {
  var matrixLxU = doMatrMult_AB(matrixL, matrixU);
  var matrixPxA = doMatrMult_AB(permut_matrix, matrixA);
  if (matrixLxU == false || matrixPxA == false)
    return false;
  var str =
      "<html><title>checkWin</title><body bgcolor='#006699'>"
    + "<pre><table border='1' cellspacing='8' align='center'>"
    + "<tr><td bgcolor='#ffffff' align='center'><b>L</b></td>"
    + "<td></td>"
    + "<td bgcolor='#ffffff' align='center'><b>U</b></td>"
    + "<td></td><td></td></tr><tr>"
    + "<td bgcolor='#ffffff'><pre>" + matrixL + "</pre></td>"
    + "<td bgcolor='#f0f0f0' valign='middle'> <b>X</b> </td>"
    + "<td bgcolor='#ffffff'><pre>" + matrixU + "</pre></td>"
      + "<td bgcolor='#f0f0f0' valign='middle'> <b>=</b> </td>"
    + "<td bgcolor='#ffffff'><pre>" + matr2str(matrixLxU)+"</pre></td></tr>"
    + "<tr><td colspan='5'></td></tr>"
    + "<tr><td bgcolor='#ffffff' align='center'><b>P</b></td>"
    + "<td></td>"
    + "<td bgcolor='#ffffff' align='center'><b>A</b></td>"
    + "<td></td><td></td></tr><tr>"
    + "<td bgcolor='#ffffff' align='center'><pre>" + permut_matrix + "</pre></td>"
    + "<td bgcolor='#f0f0f0' valign='middle'> <b>X</b> </td>"
    + "<td bgcolor='#ffffff'><pre>"+ matr2str(parseMatrix(matrixA)) +"</pre></td>"
      + "<td bgcolor='#f0f0f0' valign='middle'> <b>=</b> </td>"
    + "<td bgcolor='#ffffff'><pre>" + matr2str(matrixPxA)+"</pre></td></tr>"
    + "</table>"
    + "<p style='text-align:center; color:white'>"
    + "[<a href='javascript:self.close()' style='color:white'>Close</a>]</p>"
    + "</body></html>";

  checkWin = window.open("", "", config="width=toolbar=no,menubar=no,"
              + "location=no,directories=no,status=no,resizable=yes,scrollbars=yes,"
              + "top=100,left=200,width=600,height=300");
  checkWin.focus();
  checkWin.document.write(str);
  checkWin.document.close();
}


/**************************************************************/
// matrix parsing
/**************************************************************/

function reduceWhitespaces(str) {
  // remove leading whitespaces
  str = str.substr( str.search(/\S/) )
  // remove carriage returns (CR)
  str = str.replace(/\r|\+/g, "");
  // convert tabs to a space
  str = str.replace(/\t/g, " ");

  // reduce spaces - more than one -> one
  str = str.replace(/ {2,}/g, " ");
  // reduce new lines - more than one -> one
  str = str.replace(/\n{2,}/g, "\n");
  // clear spaces at the beginning and the end of the rows
  str = str.replace(/ +\n+ +|\n+ +| +\n+/g, "\n");

  // remove ending whitespaces
  str = str.replace(/\s+$/g,"")
  return str;
}

/*****************************/

function parseMatrix(matrixStr) {
  matrixStr = reduceWhitespaces(matrixStr);
  //    if there are
  // 1. no digits
  // 2. other chars than digits, slashes, whitespaces, dots, dashes
  // 3. chars like '-/'
  // 4. permutations of  (/slash, dot) + d*
  //             + permutaions of (slash, dot, dash)
  // 5. chars like '-d*-' ('d' means digit, * - 0 or more)
  // 6. alone dot - ' . '
  // 7. alone minus - ' - '
  // 8. non-digit + slash + one or more non-digits - 'D/D*'
  // 9. chars like 'dd-'
  if (matrixStr.search( /\d/               ) == -1 ||     // 1.
    matrixStr.search( /[^0-9\/\s\.-]/    ) != -1 ||     // 2.
    matrixStr.search( /\-\//             ) != -1 ||     // 3.
    matrixStr.search( /[\/\.]\d*[\/\.-]/ ) != -1 ||     // 4.
    matrixStr.search( /-\d*-/            ) != -1 ||     // 5.
    matrixStr.search( /\s\.\s|\s\.$/     ) != -1 ||     // 6.
    matrixStr.search( /\s-\s|\s-$/       ) != -1 ||     // 7.
    matrixStr.search( /\D\/\D*/          ) != -1 ||     // 8.
    matrixStr.search( /\d+-/             ) != -1  ) {   // 9.

      errorMsg('The matrix is empty or '
              + 'there are non-digits in it.');
      return false;
  }

  var tempRows = matrixStr.split("\n")
  var matrix = new Array();
  matrix[0] = tempRows[0].split(" ");
  var tempFrac = new Array(2); // numerator & denominator
  var tmp = "";

  for (var j=0; j < matrix[0].length; j++) {
    tmp = matrix[0][j];
    if (tmp.indexOf(".") != -1) {
      matrix[0][j] = float2frac(tmp);
    } else {
      if (tmp.indexOf("/") == -1) {
          tmp += "/";
      }
      tempFrac = tmp.split("/");
      if (tempFrac[1] == "" || parseInt(tempFrac[1]) == 0)
          tempFrac[1] = 1;
      matrix[0][j] = tempFrac;
    }
  }

  for (var i=1; i < tempRows.length; i++) {
    matrix[i] = tempRows[i].split(" ");
    if (matrix[i].length != matrix[i-1].length) {
      errorMsg('Different rows have different number of elements.\n\n'
          + 'row ' + i + ' = ' + matrix[i-1].length + ' elements\n'
          + 'row ' + (i+1) + ' = ' + matrix[i].length + ' elements\n');
      return false;
    }
    for (var j=0; j < matrix[i].length; j++) {
      tmp = matrix[i][j];
      if (tmp.indexOf(".") != -1) {
        matrix[i][j] = float2frac(tmp);
      } else {
        if (tmp.indexOf("/") == -1) {
          tmp += "/";
        }
        tempFrac = tmp.split("/");
        if (tempFrac[1] == "" || parseInt(tempFrac[1]) == 0)
          tempFrac[1] = 1;
        matrix[i][j] = tempFrac;
      }
    }
  }
  return matrix;
}


function float2frac(floatNum) {
  var str = String(floatNum);
  var sign = str.charAt(0) == '-' ? -1 : 1;
  var point = str.indexOf(".");
  var integ = parseInt( str.substring(0, point) );
  if (isNaN(integ))
    integ = 0;

  var frac_str = str.substr(point+1);
  var fracLen = frac_str.length;
  var frac = parseInt(frac_str, 10);
  if (isNaN(frac)) {
    frac = 0;
    denom = 1;
  } else {
    denom = Math.pow(10, fracLen);
  }

  return normalizeFrac(
    new Array(
         denom * integ + sign * frac,
         denom) );
}


/**************************************************************/
// matrix arithmetic
/**************************************************************/

function multiplyMatr(matrixA, matrixB) {
  var rowsA = matrixA.length;
  var rowsB = matrixB.length; // == colsA
  var colsB = matrixB[0].length;
  matrixC = new Array(rowsA);

  for (var i=0; i < rowsA; i++) {
    matrixC[i] = new Array(colsB);
  }

  for (var k=0; k < colsB; k++) {
    for (var i=0; i < rowsA; i++) {
      var temp = new Array(0,1);
      for (var j=0; j < rowsB; j++) {
        temp =
          addFracs( temp, multFracs(matrixA[i][j], matrixB[j][k]) );
      }
      matrixC[i][k] = temp;
    }
  }
  return matrixC;
}


/****************************************************/

function addMatr(matrixA, matrixB) {
  var rowsA = matrixA.length; // == rowsB
  var colsA = matrixA[0].length; // == colsB
  matrixC = new Array(rowsA);

  for (var i=0; i < rowsA; i++) {
    matrixC[i] = new Array(colsA);
    for (var j=0; j < colsA; j++) {
      matrixC[i][j] = addFracs(matrixA[i][j], matrixB[i][j]);
    }
  }
  return matrixC;
}


/****************************************************/

function isSquare(matrix) {
  return matrix.length == matrix[0].length;
}

/****************************************************/

function isRegular(matrix) {
  if (!isSquare(matrix)) {
    errorMsg('The matrix is not square.');
    return false;
  }
  var rows = matrix.length;

  nextRow:
  for (var i=0; i < rows; i++) {
    for (var j=0; j < rows; j++) {
      if (matrix[j][i][0] != 0) {
        continue nextRow;
      }
    }
    errorMsg('The matrix is singular.');
    return false;
  }
  return true;
}



/**************************************************************/
// public functions
/**************************************************************/

function doMatrMult_AB(matrixA, matrixB) {
  matrixA = parseMatrix(matrixA);
  if (matrixA == false)
    return false;
  matrixB = parseMatrix(matrixB);
  if (matrixB == false)
    return false;

  if (canBeMult(matrixA, matrixB)) {
    return multiplyMatr(matrixA, matrixB);
  } else {
    errorMsg('The columns of the first matrix must be equal to the rows '
        + 'of the second one.\nThey can not be multiplied.');
    return false;
  }
}

/****************************************************/

function doMatrMult_ABA(matrixA, matrixB) {
  matrixA = parseMatrix(matrixA);
  if (matrixA == false)
    return false;
  matrixB = parseMatrix(matrixB);
  if (matrixB == false)
    return false;
  if (canBeMult(matrixA, matrixB) && canBeMult(matrixB, matrixA) ) {
    return multiplyMatr( multiplyMatr(matrixA, matrixB),
                         matrixA );
  } else {
    errorMsg('The columns of the first matrix must be equal to the rows '
        + 'of the second one and the columns of the second matrix '
        + 'must be equal to the rows of the first one.\n'
        + 'They can not be multiplied.');
    return false;
  }
}


function canBeMult(matrixA, matrixB) {
  var colsA = matrixA[0].length;
  var rowsB = matrixB.length;
  if (colsA != rowsB) {
    return false;
  }
  return true;
}

/****************************************************/

function powMatr(matrix) {
  matrix = parseMatrix(matrix);
  if (matrix == false)
    return false;
  if (canBeMult(matrix, matrix)) {
    return multiplyMatr(matrix, matrix);
  } else {
    errorMsg('The matrix must be square.\nIt can not be powered.');
    return false;
  }
}

/****************************************************/

function doMatrAdd(matrixA, matrixB) {
  matrixA = parseMatrix(matrixA);
  if (matrixA == false)
    return false;
  matrixB = parseMatrix(matrixB);
  if (matrixB == false)
    return false;

  if (canBeAdd(matrixA, matrixB)) {
    return addMatr(matrixA, matrixB);
  } else {
    errorMsg('The dimensions of the matrices are different. \n'
        + 'They can not be added.');
    return false;
  }
}


function canBeAdd(matrixA, matrixB) {
  if (matrixA.length != matrixB.length ||
      matrixA[0].length != matrixB[0].length) {
        return false;
  }
  return true;
}


/**************************************************************/
// matrix.toString()
/**************************************************************/

function matr2str(matrix) {
  var str = "";
  var maxNumer = getMaxDigits(matrix, 0);
  var maxDenom = getMaxDigits(matrix, 1);
  var diff = 0;

  for (var i=0; i < matrix.length; i++) {
    for (var j=0; j < matrix[0].length; j++) {
      if (matrix[i][j][0] == undefined ||
          matrix[i][j][1] == undefined) {
            errorMsg("Undefined element at [" + i +"]["+ j+"]");
      }
      diff = maxNumer - matrix[i][j][0].toString().length;
      for (var k=0; k < diff; k++) {
        str += " ";
      }
      str += matrix[i][j][0];
      if (matrix[i][j][1] != 1 && matrix[i][j][0] != 0) {
        str += "/" + matrix[i][j][1];
      } else {
        str += "  ";
      }
      diff = maxDenom - matrix[i][j][1].toString().length;
      for (var k=0; k < diff+1; k++)
        str += " ";
    }
    str += "\n";
  }
  return str;
}


function getMaxDigits(matrix, index){
  var max = 0;
  var temp = 0;
  for (var i=0; i < matrix.length; i++) {
    for (var j=0; j < matrix[0].length; j++) {
      temp = matrix[i][j][index].toString().length;
      if (temp > max)
        max = temp;
    }
  }
  return max;
}


/**************************************************************/
// LU Decomposition
/**************************************************************/

function decomposeLU(matrix) {

  var dim = matrix.length;
  // permutation matrix
  var permMatr = getIdentMatr(dim);
  var quotient = new Array(1, 1);
  var found = false;
  for (var k = 0; k < dim-1; k++) {
    for (var i = k+1; i < dim; i++) {
      if (matrix[k][k][0] == 0) {
        for (var p = k+1; p < dim; p++) {
          if (matrix[p][k][0] != 0) {
            matrix = swapRows(matrix, k, p);
            permMatr = swapRows(permMatr, k, p);
            found = true;
          }
        }
        if (!found) {
          errorMsg('The matrix is singular.');
          return false;
        }
      }
      quotient = divFracs(matrix[i][k], matrix[k][k]);
      matrix[i][k] = quotient;
      for (var j = k+1; j < dim; j++) {
        matrix[i][j] =
          subFracs( matrix[i][j], multFracs(quotient, matrix[k][j]) );
      }
    }
  }
  var matrices = extractLU(matrix);
  matrices['P'] = permMatr;
  return matrices;
}

/****************************************************/

function getIdentMatr(dim) {
  var identMatr = new Array(dim);

  for (var i=0; i < dim; i++) {
    identMatr[i] = new Array(dim);
    for (var j=0; j < dim; j++) {
      identMatr[i][j] = new Array(2);
      identMatr[i][j][0] = i == j ? 1 : 0;
      identMatr[i][j][1] = 1;
    }
  }
  return identMatr;
}

/****************************************************/

function extractLU(matrixLU) {
  var dim = matrixLU.length;
  var matrixL = new Array(dim);
  var matrixU = new Array(dim);

  for (var i=0; i < dim; i++) {
    matrixL[i] = new Array(dim);
    matrixU[i] = new Array(dim);
  }

  for (var i=0; i < dim; i++) {
    for (var j=0; j <= i; j++) {
      matrixL[j][i] = new Array(0, 1);
      matrixU[j][i] = matrixLU[j][i];
    }
  }

  for (var i=1; i < dim; i++) {
    for (var j=0; j < i; j++) {
      matrixL[i][j] = matrixLU[i][j];
      matrixU[i][j] = new Array(0, 1);
    }
  }

  for (var i=0; i < dim; i++) {
    matrixL[i][i] = new Array(1, 1);
  }

  var matrices = new Array();
  matrices['L'] = matrixL;
  matrices['U'] = matrixU;
  return matrices;
}


// solve system of linear equations
function solve_lineq(coefs, vec) {
  if (coefs.length != vec.length) {
    errorMsg('The dimension of the right-side vector must be '+
      'equal to the dimensions of the coefficient matrix, i.e. '+
      'if the matrix is 3x3 then the vector must have 3 elements.');
    return false;
  }
  var matrices = decomposeLU(coefs);
/*  alert('== L ==\n'+matr2str(matrices['L'])+
  '\n---\n== U ==\n'+matr2str(matrices['U']));*/
  var y = solve_lineq_ltm(matrices['L'], multiplyMatr(matrices['P'], vec));
  return solve_lineq_utm(matrices['U'], y);
}


// solve system of linear equations using an upper triangular matrix
function solve_lineq_utm(utm, vec) {
  var dim = vec.length;
  var solut = new Array(dim);

  for (var i = dim-1; i >= 0; i--) {
    var right = vec[i][0];
    for (var k = i+1; k < dim; k++) {
      right =
        subFracs(right, multFracs(utm[i][k], solut[k][0]));
    }
    solut[i] = new Array(1);
    solut[i][0] = divFracs(right, utm[i][i]);
  }

  return solut;
}


// solve system of linear equations using an lower triangular matrix
function solve_lineq_ltm(ltm, vec) {
  var dim = vec.length;
  var solut = new Array(dim);
  for (var i = 0; i < dim; i++) {
    var right = vec[i][0];
    for (var k = i-1; k >= 0; k--) {
      right = subFracs(right, multFracs(ltm[i][k], solut[k][0]));
    }
    solut[i] = new Array(1);
    solut[i][0] = divFracs(right, ltm[i][i]);
  }

  return solut;
}


/***********************************************************/

function clearFileds() {
  for (var i = 0; i < clearFileds.arguments.length; i++) {
    clearFileds.arguments[i].value = "";
  }
}

/****************************************************/

function swapRows(matrix, rowA, rowB) {
  var tmp = matrix[rowA];
  matrix[rowA] = matrix[rowB];
  matrix[rowB] = tmp;
  return matrix;
}

/****************************************************/

function errorMsg(msg) {
  alert("Error: \n" + msg);
}

/**************************************************************/
// Basic functions
/**************************************************************/

// @return great common divisor of a and b
function gcd(a, b) {
  if (a == 0 || b == 0) return 1;
  a = Math.abs(a);
  b = Math.abs(b);
  if (a < b) {
      var tmp = b;
      b = a;
      a = tmp;
  }
  var rest = 1;
  while ( (rest = a%b) != 0) {
      a = b;
      b = rest;
  }
  return b;
}

/****************************************************/

// @return least common multiple of a and b
function lcm(a, b) {
  return a*b / gcd(a, b);
}

/****************************************************/

function sig(i) {
  return i < 0 ? -1 : 1;
}

/****************************************************/

/*
  @return (frac1 + frac2), i.e.
   2        3        7
  ---  +  ----  =  ----
   5       10       10
*/
function addFracs(frac1, frac2) {
  checkFracs(frac1, frac2);
  if (frac1[0] == 0)
    return normalizeFrac(frac2);
  else if (frac2[0] == 0)
    return normalizeFrac(frac1);
  else if (frac1[1] == 0 || frac2[1] == 0) {
    errorMsg("addFracs(): Denominator is 0.");
    return false;
  }

  return normalizeFrac(
    new Array(
        frac1[0] * frac2[1] + frac1[1] * frac2[0],
        frac1[1] * frac2[1] ));
}

/****************************************************/

function subFracs(frac1, frac2) {
  return addFracs(frac1, new Array(-1*frac2[0], frac2[1]));
}

/****************************************************/

/*
  @return frac1 x frac2,
   2        3        3
  ---  x  ----  =  ----
   5       10       25
*/
function multFracs(frac1, frac2) {
  checkFracs(frac1, frac2);
  if (frac1[0] == 0 || frac2[0] == 0)
    return new Array(0,1);
  else if (frac1[1] == 0 || frac2[1] == 0) {
    errorMsg("multFracs(): Denominator is 0.");
    return false;
  }
  return normalizeFrac(
    new Array(
        frac1[0] * frac2[0],
        frac1[1] * frac2[1] ));
}

/****************************************************/

function divFracs(frac1, frac2) {
  return multFracs(frac1, reciprocal(frac2));
}

/****************************************************/

function reciprocal(frac) {
  if (frac[0] == 0) {
    return new Array(0, 1);
  }
  return new Array(frac[1] * sig(frac[0]), Math.abs(frac[0]));
}

/****************************************************/
function Square(getal) {
   return getal*getal 
}
/****************************************************/
function Maxi2(getal1,getal2) {
   if (getal1<getal2)
       { 
         return getal2;
       }else{;
           return getal1;
         }
}
/****************************************************/
function Mini2(getal1,getal2) {
   if (getal1>getal2)
       { 
         return getal2;
       }else{;
           return getal1;
         }
}

/****************************************************/
function checkFracs(frac1, frac2) {
  for (var i=0; i<2; i++) {
    if (isNaN(frac1[i]) || isNaN(frac2[i])) {
      errorMsg("Either of the fractions is NaN.");
      return false;
    }
  }
  return true;
}

/****************************************************/

function normalizeFrac(frac) {
  var _gcd = gcd(frac[0], frac[1]);
  frac[0] /= _gcd; // numerator
  frac[1] /= _gcd; // denominator
  return frac;
}


/****************************************************/
/*** SVD code /
/*** plarmuseau@pandora.be
/****************************************************/
function matrixsimpel(matrix,aantr,aantc) {
  var identMatr = new Array(aantr);
      for (var i=0; i < aantr; i++) {
        identMatr[i] = new Array(aantc);  
        for (var j=0; j < aantc; j++) {
            identMatr[i][j] = matrix[i][j][0];
    }
  }
  return identMatr;
}

function matrixfract(matrix,aantr,aantc) {
  var identMatr = new Array(aantr);
      for (var i=0; i < aantr; i++) {
        identMatr[i] = new Array(aantc);
        for (var j=0; j < aantc; j++) {
            identMatr[i][j] = new Array(2);
            identMatr[i][j][0] = matrix[i][j];
            identMatr[i][j][1] = 1;                     
    }
  }
  return identMatr;
}


/***************************************************************************
* Singular Value Decomposition.                                            *
***************************************************************************/
function SameSign(a,b) 
    {
    if( b >= 0.0 ) t =absoluut( a );
    else t = -absoluut( a );
    return t;
    }
/****************************************************/
function absoluut(getal) {
   if (getal<0) getal=-getal;
     return getal 
}
/****************************************************/
function pythag(a, b) {
    at = absoluut(a);
    bt = absoluut(b);
    if( at > bt ) {
        return at * Math.sqrt( 1.0 + Square( bt / at ) );
    } else { if( bt > 0.0 ){
        return bt * Math.sqrt( 1.0 + Square( at / bt ) );
    } else { return 0.0;}}
    }

//#include <cmath>
//#include "nr.h"
//using namespace std;
// void NR::svdcmp(Mat_IO_DP &a, Vec_O_DP &w, Mat_O_DP &v)

function svdcmp(A,W,V)
{
    var flag;
    var i,its,j,jj,k,l,nm;
    var anorm,c,f,g,h,s,scale,x,y,z;
//  m=a.nrows();
//  n=a.ncols();
//  Vec_DP rv1(n);
  var m = A.length;      // m rows 3
  var n = A[0].length;  //  n cols 2
//    errorMsg(m);  
  var rv1 = new Array(n)
    g=scale=anorm=0.0;
    for (i=0;i<n;i++) {
        l=i+2;
        rv1[i]=scale*g;     
        g=s=scale=0.0;
        if (i < m) {
            for (k=i;k<m;k++) scale += Math.abs(A[k][i]);
            if (scale != 0.0) {
                for (k=i;k<m;k++) {
                    A[k][i] /= scale;
                    s += A[k][i]*A[k][i];
                }
                f=A[i][i];
                g = -SameSign(Math.sqrt(s),f);
                h=f*g-s;
                A[i][i]=f-g;
                for (j=l-1;j<n;j++) {
                    for (s=0.0,k=i;k<m;k++) s += A[k][i]*A[k][j];
                    f=s/h;
                    for (k=i;k<m;k++) A[k][j] += f*A[k][i];
                }
                for (k=i;k<m;k++) A[k][i] *= scale;
            }
        }
        W[i][0]=scale *g;
        g=s=scale=0.0;
        if (i+1 <= m && i != n) {
            for (k=l-1;k<n;k++) scale += Math.abs(A[i][k]);
            if (scale != 0.0) {
                for (k=l-1;k<n;k++) {
                    A[i][k] /= scale;
                    s += A[i][k]*A[i][k];
                }
                f=A[i][l-1];
                g = -SameSign(Math.sqrt(s),f);
                h=f*g-s;
                A[i][l-1]=f-g;
                for (k=l-1;k<n;k++) rv1[k]=A[i][k]/h;
                for (j=l-1;j<m;j++) {
                    for (s=0.0,k=l-1;k<n;k++) s += A[j][k]*A[i][k];
                    for (k=l-1;k<n;k++) A[j][k] += s*rv1[k];
                }
                for (k=l-1;k<n;k++) A[i][k] *= scale;
            }
        }
        anorm=Maxi2(anorm,(Math.abs(W[i][0])+Math.abs(rv1[i])));
    }
  for (i=n-1;i>=0;i--) {
        if (i < n-1) {
            if (g != 0.0) {
                for (j=l;j<n;j++)
                    V[j][i]=(A[i][j]/A[i][l])/g;
                for (j=l;j<n;j++) {
                    for (s=0.0,k=l;k<n;k++) s += A[i][k]*V[k][j];
                    for (k=l;k<n;k++) V[k][j] += s*V[k][i];
                }
            }
            for (j=l;j<n;j++) V[i][j]=V[j][i]=0.0;
        }
        V[i][i]=1.0;
        g=rv1[i];
        l=i;
    }
    for (i=Mini2(m,n)-1;i>=0;i--) {
        l=i+1;
        g=W[i][0];
        for (j=l;j<n;j++) A[i][j]=0.0;
        if (g != 0.0) {
            g=1.0/g;
            for (j=l;j<n;j++) {
                for (s=0.0,k=l;k<m;k++) s += A[k][i]*A[k][j];
                f=(s/A[i][i])*g;
                for (k=i;k<m;k++) A[k][j] += f*A[k][i];
            }
            for (j=i;j<m;j++) A[j][i] *= g;
        } else for (j=i;j<m;j++) A[j][i]=0.0;
        ++A[i][i];
    }
    for (k=n-1;k>=0;k--) {
        for (its=0;its<30;its++) {
            flag=true;
            for (l=k;l>=0;l--) {
                nm=l-1;
                if (Math.abs(rv1[l])+anorm == anorm) {
                    flag=false;
                    break;
                }
                if (Math.abs(W[nm])+anorm == anorm) break;
            }
            if (flag) {
                c=0.0;
                s=1.0;
                for (i=l-1;i<k+1;i++) {
                    f=s*rv1[i];
                    rv1[i]=c*rv1[i];
                    if (Math.abs(f)+anorm == anorm) break;
                    g=W[i][0];
                    h=pythag(f,g);
                    W[i][0]=h;
                    h=1.0/h;
                    c=g*h;
                    s = -f*h;
                    for (j=0;j<m;j++) {
                        y=A[j][nm];
                        z=A[j][i];
                        A[j][nm]=y*c+z*s;
                        A[j][i]=z*c-y*s;
                    }
                }
            }
            z=W[k][0];
            if (l == k) {
                if (z < 0.0) {
                    W[k][0] = -z;
                    for (j=0;j<n;j++) V[j][k] = -V[j][k];
                }
                break;
            }
            if (its == 29) nrerror("no convergence in 30 svdcmp iterations");
            x=W[l][0];
            nm=k-1;
            y=W[nm][0];
            g=rv1[nm];
            h=rv1[k];
            f=((y-z)*(y+z)+(g-h)*(g+h))/(2.0*h*y);
            g=pythag(f,1.0);
            f=((x-z)*(x+z)+h*((y/(f+SameSign(g,f)))-h))/x;
            c=s=1.0;
            for (j=l;j<=nm;j++) {
                i=j+1;
                g=rv1[i];
                y=W[i][0];
                h=s*g;
                g=c*g;
                z=pythag(f,h);
                rv1[j]=z;
                c=f/z;
                s=h/z;
                f=x*c+g*s;
                g=g*c-x*s;
                h=y*s;
                y *= c;
                for (jj=0;jj<n;jj++) {
                    x=V[jj][j];
                    z=V[jj][i];
                    V[jj][j]=x*c+z*s;
                    V[jj][i]=z*c-x*s;
                }
                z=pythag(f,h);
                W[j][0]=z;
                if (z) {
                    z=1.0/z;
                    c=f*z;
                    s=h*z;
                }
                f=c*g+s*y;
                x=c*y-s*g;
                for (jj=0;jj<m;jj++) {
                    y=A[jj][j];
                    z=A[jj][i];
                    A[jj][j]=y*c+z*s;
                    A[jj][i]=z*c-y*s;
                }
            }
            rv1[l]=0.0;
            rv1[k]=f;
            W[k][0]=x;
        }
    }
      var W2= new Array(n);
      for (i=0;i<n;i++) {
        W2[i]= new Array(m)
            for (j=0;j<m;j++){
                      W2[i][j]=0.0;
                  W2[i][i]=W[i][0];
//                          errorMsg(W[i][0]);
                               }
                             }
    var matrices = new Array();
    matrices['A'] = A;
    matrices['V'] = V;
    matrices['W2'] = W2;    
    return matrices;

//***** nep tussenstop
//   var matrices = new Array();
//   matrices['A'] = A;
//   matrices['V'] = V;
//   matrices['W'] = W; 
//   return matrices;
// nep einde

//function test(){
//***** nep tussenstop



}