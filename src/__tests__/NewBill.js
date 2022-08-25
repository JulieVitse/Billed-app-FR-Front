/**
 * @jest-environment jsdom
 */
 import "@testing-library/jest-dom"
 import userEvent from '@testing-library/user-event'
 import {screen, waitFor, fireEvent} from "@testing-library/dom"

import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"

import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const mailIcon = screen.getByTestId('icon-mail') // récupère l'icône par son testid
      expect(mailIcon).toHaveClass('active-icon') //check si l'icône est en surbrillance - on vérifie si l'élément a la classe correspondante
    })

    test('Then, the form should be displayed', () => {
      document.body.innerHTML = NewBillUI(); // affiche le page

      const formNewBill = screen.getByTestId("form-new-bill"); // récupère le dataid du formulaire
      expect(formNewBill).toBeTruthy(); // vérifie ensuite que le formulaire soit bien présent sur la page
    })

    describe("When I click on the submit button and the required inputs are empty", () => {
      test ("Then, it should not send the form and the form stays on the screen", () => {

      // défini le chemin d'accès
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      //je suis sur une nouvelle note de frais
      const html = NewBillUI();
      document.body.innerHTML = html;
        
      //je ne remplis pas les champs date, ttc et fichier joint
      const dateInput = screen.getByTestId("datepicker");
      dateInput.value = "";
      const selectInput = screen.getByTestId("expense-type");
      selectInput.value = "";
      const montantTTC = screen.getByTestId("amount");
      montantTTC.value = "";
      const montantTVA = screen.getByTestId("pct");
      montantTVA.value = "";
      const fileInput = screen.getByTestId("file");
      fileInput.value = "";
      const expenseNameInput = screen.getByTestId("expense-name");
      expenseNameInput.value = "sample test value";

      const newBillContainer = new NewBill({
        document, onNavigate, store: null, localStorage: window.localStorage
      })

      const sendBillForm = jest.fn(newBillContainer.handleSubmit);
      const formNewBill = screen.getByTestId("form-new-bill")//je cible le formulaire de la nouvelle note de frais
      formNewBill.addEventListener("submit", sendBillForm)//ecoute d'évènement
      fireEvent.submit(formNewBill)//simulation de l'évènement
      expect(sendBillForm).toHaveBeenCalled();
      expect(formNewBill).toBeTruthy(); //après l'évènement le formulaire reste à l'écran
      expect(dateInput.value).toBe("");
      expect(expenseNameInput.value).toBe("sample test value");
      })
    })
  })

  
})

