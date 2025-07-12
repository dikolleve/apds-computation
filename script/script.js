// DOM elements for loan form inputs, displays, buttons, and state
      const loanAmount = document.querySelector("#loanAmount");
      const loanTerm = document.querySelector("#loanTerm");
      const deduction = document.querySelector("#deduction");
      const serviceFee = document.querySelector("#serviceFee");
      const btnCblic = document.querySelector("#btnCblic");
      const displayCblic = document.querySelector("#displayCblic");
      const addBalField = document.querySelector("#addBalField");
      const loanBalFields = document.querySelector("#loanBalFields");
      const savings = document.querySelector("#savings");
      const netproceeds = document.querySelector("#netproceeds");
      const clear1 = document.querySelector("#clear1");
      const clear2 = document.querySelector("#clear2");
      const form1 = document.querySelector("#form1");
      const form2 = document.querySelector("#form2");
      let isCblic = false;

      //*********************** code for 1st div form-compute *********************** //

      //handle clear for form1 (div)
      const handleClear1 = () => {
        const inputs = form1.querySelectorAll("input");
        const selects = form1.querySelectorAll("select");
        const loanBalInput = loanBalFields.querySelectorAll(".loan-bal-input");

        //loop all inputs in form1 (div) to clear
        inputs.forEach((input) => (input.value = ""));

        //used forEach to loop on removing balance input field
        loanBalInput.forEach((balInput, index) => {
          if (index !== 0) {
            balInput.remove();
            x = 0; // set to 0 the loop of loan balance field
          }
        });

        //set the index to 0 on select field
        selects.forEach((select) => (select.selectedIndex = 0));

        //hide cblic field
        displayCblic.classList.toggle("d-none");
        isCblic = false;
        //toggle the text and background color of cblic button
        btnCblic.innerText = "ADD CBLIC";
        btnCblic.style.backgroundColor = "#1a73ba";
      };

      //handle clear for form2 (div)
      const handleClear2 = () => {
        const inputs = form2.querySelectorAll("input");
        const selects = form2.querySelectorAll("select");

        inputs.forEach((input) => (input.value = ""));
        selects.forEach((select) => (select.selectedIndex = 0));
      };

      // Function to format number with commas and allow decimals
      const formatNumberWithCommas = (value) => {
        value = value.replace(/[^0-9.]/g, "");
        let [integer, decimal] = value.split(".");
        integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        return decimal ? `${integer}.${decimal}` : integer;
      };

      // Event listener for the blur event
      const formatOnBlur = (event) => {
        let value = event.target.value;
        const formattedValue = formatNumberWithCommas(value);
        event.target.value = formattedValue;
      };

      // Add event listeners to your input fields for the 'blur' event
      document.querySelectorAll(".formatted-input").forEach((input) => {
        input.addEventListener("blur", formatOnBlur);
      });

      //use onBlur event to automatically put comma on numbers
      loanBalFields.addEventListener(
        "blur",
        (event) => {
          if (
            event.target &&
            event.target.classList.contains("formatted-input")
          ) {
            // Trigger the formatOnBlur function when the input loses focus
            formatOnBlur(event);
          }
        },
        true
      ); // Use the capture phase so it runs before other handlers on the target

      //remove loan balance field one by one except the first one loan balance field
      const removeLoanBalField = (e) => {
        const target = e.target.parentElement.parentElement;
        target.remove();
        calculate();
      };

      // to add dynamic loan balance field
      let x = 1; //iterator
      const handleAddBalField = () => {
        if (x < 10) {
          const div1 = document.createElement("div");
          div1.className = "loan-bal-input";
          div1.style.marginTop = "5px";

          const label = document.createElement("label");
          label.className = "form-label";

          label.textContent = "LOAN BALANCE";
          div1.appendChild(label);

          const div2 = document.createElement("div");
          div2.style.display = "flex";

          const input = document.createElement("input");
          input.type = "text";
          input.placeholder = "enter loan balance";
          input.classList.add("form-control", "input-bal", "formatted-input");
          div2.appendChild(input);

          const button = document.createElement("button");
          button.className = "btn-x";
          button.textContent = "X";
          button.addEventListener("click", removeLoanBalField);
          div2.appendChild(button);

          div1.appendChild(div2);

          loanBalFields.appendChild(div1);

          calculate();
        }
        x++;
      };

      // toggle cblic hide and unhide
      const toggleCblic = () => {
        //let displayCblic = document.querySelector("#displayCblic");
        let btnText = btnCblic.innerText;

        displayCblic.classList.toggle("d-none");
        if (btnText === "ADD CBLIC") {
          isCblic = true;
          calculate();
          btnCblic.innerText = "REMOVE CBLIC";
          btnCblic.style.backgroundColor = "#ef4444";
        } else {
          isCblic = false;
          btnCblic.innerText = "ADD CBLIC";
          btnCblic.style.backgroundColor = "#1a73ba";
          calculate();
        }
      };

      //Round it to two decimal places, and Format it with commas (if necessary) and exactly two decimal digits, using English locale.
      const formatNumbers = (num) => {
        return Number(parseFloat(num).toFixed(2)).toLocaleString("en", {
          minimumFractionDigits: 2,
        });
      };

      //APDS rates
      const getApdsRates = (term) => {
        const apdsRates = {
          60: 1.26481,
          48: 1.20958,
          36: 1.15588,
          24: 1.09643,
          12: 1.04109,
        };

        return apdsRates[term] ?? "not found";
      };

      //CBLIC RATES
      const getCblicRates = (term) => {
        const cblicRates = {
          60: 1.92 / 100,
          48: 1.54 / 100,
          36: 1.13 / 100,
          24: 0.75 / 100,
          12: 0.38 / 100,
        };

        return cblicRates[term] ?? "not found";
      };

      //calculate net proceeds
      const calculate = () => {
        const removeCommas = (value) => value.replace(/,/g, ""); // This removes all commas from the string

        const { value: term } = loanTerm;
        const { value: serviceCharge } = serviceFee;
        const loanProceedsElement = document.querySelector("#loanProceeds");
        const cblicElement = document.querySelector("#cblic");
        const loanBalances = document.querySelectorAll(".input-bal");
        const loanAmountValue = parseFloat(removeCommas(loanAmount.value) || 0);
        console.log(loanAmountValue);

        // Helper functions
        const computeDeduction = (amount, rates, term) =>
          (amount * rates) / term;
        const computeLoanProceeds = (amount, serviceCharge) =>
          amount * serviceCharge;
        const computeCblic = (amount, rates, cblicRate) =>
          amount * rates * cblicRate;

        // to compute sum all loan balances
        const computeSum = (elements) =>
          Array.from(elements).reduce(
            (acc, curr) => acc + parseFloat(removeCommas(curr.value) || 0),
            0
          );

        // Get rates
        const rates = getApdsRates(term);
        const cblicRate = getCblicRates(term);

        // Compute values
        const deductionValue = computeDeduction(loanAmountValue, rates, term);
        const loanProceedsValue = computeLoanProceeds(
          loanAmountValue,
          serviceCharge
        );
        const cblicValue = computeCblic(loanAmountValue, rates, cblicRate);
        const sumBalances = computeSum(loanBalances);

        // Log sum for debugging
        //console.log(sumBalances);

        // Format and update DOM elements
        deduction.value = formatNumbers(deductionValue);
        loanProceedsElement.value = formatNumbers(loanProceedsValue);
        cblicElement.value = formatNumbers(cblicValue);

        const baseNetProceeds =
          loanProceedsValue - sumBalances - parseFloat(savings.value || 0);

        // If CBIC is applied, subtract CBIC value from net proceeds
        netproceeds.value = formatNumbers(
          isCblic ? baseNetProceeds - cblicValue : baseNetProceeds
        );
      };

      loanAmount.addEventListener("input", calculate);
      loanTerm.addEventListener("change", calculate);
      serviceFee.addEventListener("change", calculate);
      btnCblic.addEventListener("click", toggleCblic);
      addBalField.addEventListener("click", handleAddBalField);
      savings.addEventListener("input", calculate);
      clear1.addEventListener("click", handleClear1);
      clear2.addEventListener("click", handleClear2);

      // Event delegation for both 'input' and 'blur' events
      loanBalFields.addEventListener("input", (event) => {
        if (
          event.target &&
          event.target.classList.contains("formatted-input")
        ) {
          // Trigger the calculate function when the input changes
          calculate();
        }
      });

      //*********************** code for second div form-compute *********************** //
      const deduction2 = document.querySelector("#deduction2");
      const loanTerm2 = document.querySelector("#loanTerm2");
      const loanAmount2 = document.querySelector("#loanAmount2");

      const handleLoanAmount = () => {
        const deduction = parseFloat(
          (deduction2?.value || "0").replace(/,/g, "")
        );
        const term = loanTerm2.value;
        const rates = getApdsRates(term);

        const roundedResult = (num) => Math.round(num / 100) * 100;

        const compute = roundedResult((deduction * term) / rates);
        loanAmount2.value = formatNumbers(compute);

        const lnAmountToDeduction = (compute * rates) / term;
        deduction2.value = formatNumbers(lnAmountToDeduction);

        console.log("answer is: " + compute);
      };

      const handleLoanTerm2 = () => {
        const deduction = parseFloat(
          (deduction2?.value || "0").replace(/,/g, "")
        );
        const term = loanTerm2.value;
        const rates = getApdsRates(term);

        const roundedResult = (num) => Math.round(num / 100) * 100;

        const compute = roundedResult((deduction * term) / rates);
        loanAmount2.value = formatNumbers(compute);

        const lnAmountToDeduction = (compute * rates) / term;
        deduction2.value = formatNumbers(lnAmountToDeduction);

        console.log("answer is: " + compute);
      };

      deduction2.addEventListener("blur", handleLoanAmount);
      loanTerm2.addEventListener("change", handleLoanTerm2);