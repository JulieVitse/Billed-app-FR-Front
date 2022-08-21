/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom"
import userEvent from '@testing-library/user-event'
import {screen, waitFor, fireEvent} from "@testing-library/dom"

import BillsUI from "../views/BillsUI.js";
import Bills from '../containers/Bills.js';
import { bills } from "../fixtures/bills.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";
jest.mock("../app/Store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window') // récupère l'icône par son testid
      expect(windowIcon).toHaveClass('active-icon') //check si l'icône est en surbrillance - on vérifie si l'élément a la classe correspondante

    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })
  })
  /* -------------------- test for loading screen rendering ------------------- */
  describe('When I am on Bills page but it is loading', () => {
    test('Then, Loading page should be rendered', () => {
      document.body.innerHTML = BillsUI({ loading: true })
      expect(screen.getAllByText('Loading...')).toBeTruthy()
    })
  })

  describe('When I click on the button to create a new bill', () => {
    test('Then, it should open the NewBill page', () => {
      
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      const billsContainer = new Bills({
        document, onNavigate, store: null, bills: bills, localStorage: window.localStorage
      });

      document.body.innerHTML = BillsUI({ data: { bills } })

      const openNewBillPage = jest.fn(billsContainer.handleClickNewBill);
      const buttonNewBill = screen.getByTestId("btn-new-bill");

      buttonNewBill.addEventListener('click', openNewBillPage);
      fireEvent.click(buttonNewBill)

      expect(openNewBillPage).toHaveBeenCalled();
      expect(screen.getByTestId('form-new-bill')).toBeTruthy();

    })
  })


})

