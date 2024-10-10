import { expect, test } from "playwright-test-coverage";

test("home page", async ({ page }) => {
    await page.goto("/");

    expect(await page.title()).toBe("JWT Pizza");
});

test("about page", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("main")).toContainText("The secret sauce");
});

test("history page", async ({ page }) => {
    await page.goto("/history");
    await expect(page.getByRole("heading")).toContainText("Mama Rucci, my my");
});

test("404 page", async ({ page }) => {
    await page.goto("/notapage");
    await expect(page.getByRole("heading")).toContainText("Oops");
});

test("docs page", async ({ page }) => {
    await page.goto("/docs");
    await expect(page.getByRole("main")).toContainText("JWT Pizza API");
});

test("register", async ({ page }) => {
    await page.route("*/**/api/auth", async (route) => {
        const registerReq = {
            name: "test",
            email: "test@test.com",
            password: "test",
        };
        const registerRes = {
            user: {
                name: "test",
                email: "test@test.com",
                roles: [
                    {
                        role: "diner",
                    },
                ],
                id: 497,
            },
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEB0ZXN0LmNvbSIsInJvbGVzIjpbeyJyb2xlIjoiZGluZXIifV0sImlkIjo0OTcsImlhdCI6MTcyODQ0NzI3M30.NWLuORcU_pm0TouEOYh3BgOe27Qct_zC9z53ZetDu9k",
        };

        expect(route.request().method()).toBe("POST");
        expect(route.request().postDataJSON()).toMatchObject(registerReq);
        await route.fulfill({ json: registerRes });
    });

    await page.goto("/register");
    await page.getByPlaceholder("Full Name").fill("test");
    await page.getByPlaceholder("Email address").fill("test@test.com");
    await page.getByPlaceholder("Password").fill("test");
    await page.getByRole("button", { name: "Register" }).click();
    await expect(
        page.getByRole("link", { name: "t", exact: true })
    ).toBeVisible();
});

test("logout", async ({ page }) => {
    await page.route("*/**/api/auth", async (route) => {
        const logoutRes = {
            message: "logout successful",
        };
        expect(route.request().method()).toBe("DELETE");
        await route.fulfill({ json: logoutRes });
    });

    await page.goto("/");
    await page.evaluate(() => {
        localStorage.setItem(
            "user",
            JSON.stringify({
                id: 58,
                name: "test",
                email: "test@test.com",
                roles: [{ role: "diner" }],
            })
        );
        localStorage.setItem(
            "token",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTgsIm5hbWUiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZXMiOlt7InJvbGUiOiJkaW5lciJ9XSwiaWF0IjoxNzI4NDQ3MzI1fQ.2iY3itzQ6CbXuiGIq0W_Ack4EDJD1gLWubyYSSMRQKw"
        );
    });
    await page.reload();

    await page.goto("/logout");
    await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
});

test("login", async ({ page }) => {
    await page.route("*/**/api/auth", async (route) => {
        const loginReq = {
            email: "test@test.com",
            password: "test",
        };
        const loginRes = {
            user: {
                id: 58,
                name: "test",
                email: "test@test.com",
                roles: [
                    {
                        role: "diner",
                    },
                ],
            },
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTgsIm5hbWUiOiJ0ZXN0IiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwicm9sZXMiOlt7InJvbGUiOiJkaW5lciJ9XSwiaWF0IjoxNzI4NDQ3MzI1fQ.2iY3itzQ6CbXuiGIq0W_Ack4EDJD1gLWubyYSSMRQKw",
        };

        expect(route.request().method()).toBe("PUT");
        expect(route.request().postDataJSON()).toMatchObject(loginReq);
        await route.fulfill({ json: loginRes });
    });

    await page.goto("/login");
    await page.getByPlaceholder("Email address").click();
    await page.getByPlaceholder("Email address").fill("test@test.com");
    await page.getByPlaceholder("Email address").press("Tab");
    await page.getByPlaceholder("Password").fill("test");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(
        page.getByRole("link", { name: "t", exact: true })
    ).toBeVisible();
});

test("purchase with login", async ({ page }) => {
    await page.route("*/**/api/order/menu", async (route) => {
        const menuRes = [
            {
                id: 1,
                title: "Veggie",
                image: "pizza1.png",
                price: 0.0038,
                description: "A garden of delight",
            },
            {
                id: 2,
                title: "Pepperoni",
                image: "pizza2.png",
                price: 0.0042,
                description: "Spicy treat",
            },
        ];
        expect(route.request().method()).toBe("GET");
        await route.fulfill({ json: menuRes });
    });

    await page.route("*/**/api/franchise", async (route) => {
        const franchiseRes = [
            {
                id: 2,
                name: "LotaPizza",
                stores: [
                    { id: 4, name: "Lehi" },
                    { id: 5, name: "Springville" },
                    { id: 6, name: "American Fork" },
                ],
            },
            {
                id: 3,
                name: "PizzaCorp",
                stores: [{ id: 7, name: "Spanish Fork" }],
            },
            { id: 4, name: "topSpot", stores: [] },
        ];
        expect(route.request().method()).toBe("GET");
        await route.fulfill({ json: franchiseRes });
    });

    await page.route("*/**/api/auth", async (route) => {
        const loginReq = { email: "d@jwt.com", password: "a" };
        const loginRes = {
            user: {
                id: 3,
                name: "Kai Chen",
                email: "d@jwt.com",
                roles: [{ role: "diner" }],
            },
            token: "abcdef",
        };
        expect(route.request().method()).toBe("PUT");
        expect(route.request().postDataJSON()).toMatchObject(loginReq);
        await route.fulfill({ json: loginRes });
    });

    await page.route("*/**/api/order", async (route) => {
        const orderReq = {
            items: [
                { menuId: 1, description: "Veggie", price: 0.0038 },
                { menuId: 2, description: "Pepperoni", price: 0.0042 },
            ],
            storeId: "4",
            franchiseId: 2,
        };
        const orderRes = {
            order: {
                items: [
                    { menuId: 1, description: "Veggie", price: 0.0038 },
                    { menuId: 2, description: "Pepperoni", price: 0.0042 },
                ],
                storeId: "4",
                franchiseId: 2,
                id: 23,
            },
            jwt: "eyJpYXQ",
        };
        expect(route.request().method()).toBe("POST");
        expect(route.request().postDataJSON()).toMatchObject(orderReq);
        await route.fulfill({ json: orderRes });
    });

    await page.goto("/");

    // Go to order page
    await page.getByRole("button", { name: "Order now" }).click();

    // Create order
    await expect(page.locator("h2")).toContainText("Awesome is a click away");
    await page.getByRole("combobox").selectOption("4");
    await page
        .getByRole("link", { name: "Image Description Veggie A" })
        .click();
    await page
        .getByRole("link", { name: "Image Description Pepperoni" })
        .click();
    await expect(page.locator("form")).toContainText("Selected pizzas: 2");
    await page.getByRole("button", { name: "Checkout" }).click();

    // Login
    await page.getByPlaceholder("Email address").click();
    await page.getByPlaceholder("Email address").fill("d@jwt.com");
    await page.getByPlaceholder("Email address").press("Tab");
    await page.getByPlaceholder("Password").fill("a");
    await page.getByRole("button", { name: "Login" }).click();

    // Pay
    await expect(page.getByRole("main")).toContainText(
        "Send me those 2 pizzas right now!"
    );
    await expect(page.locator("tbody")).toContainText("Veggie");
    await expect(page.locator("tbody")).toContainText("Pepperoni");
    await expect(page.locator("tfoot")).toContainText("0.008 ₿");
    await page.getByRole("button", { name: "Pay now" }).click();

    // Check balance
    await expect(page.getByText("0.008")).toBeVisible();
});

test("admin and franchise", async ({ page }) => {
    await page.route("*/**/api/auth", async (route) => {
        const loginReq = {
            email: "a@jwt.com",
            password: "admin",
        };
        const loginRes = {
            user: {
                id: 1,
                name: "常用名字",
                email: "a@jwt.com",
                roles: [
                    {
                        role: "admin",
                    },
                ],
            },
            token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IuW4uOeUqOWQjeWtlyIsImVtYWlsIjoiYUBqd3QuY29tIiwicm9sZXMiOlt7InJvbGUiOiJhZG1pbiJ9XSwiaWF0IjoxNzI4NDQ5NzQ1fQ.rA00FD3s2SIsTxk4x_dMwG0UTSIm8cPq_kQSBophSnQ",
        };

        expect(route.request().method()).toBe("PUT");
        expect(route.request().postDataJSON()).toMatchObject(loginReq);
        await route.fulfill({ json: loginRes });
    });

    // Mock for franchise API
    let callCount = 0;
    await page.route("*/**/api/franchise", async (route) => {
        callCount++;
        const method = route.request().method();
        const postData = route.request().postDataJSON();

        switch (callCount) {
            case 1:
                const getFranchiseRes1 = [];
                expect(method).toBe("GET");
                await route.fulfill({ json: getFranchiseRes1 });

                break;
            case 2:
                const createFranchiseReq = {
                    stores: [],
                    name: "test pizza",
                    admins: [
                        {
                            email: "a@jwt.com",
                        },
                    ],
                };
                const createFranchiseRes = {
                    stores: [],
                    name: "test pizza",
                    admins: [
                        {
                            email: "a@jwt.com",
                            id: 1,
                            name: "常用名字",
                        },
                    ],
                    id: 35,
                };

                expect(method).toBe("POST");
                expect(postData).toMatchObject(createFranchiseReq);
                await route.fulfill({ json: createFranchiseRes });

                break;

            case 3:
                const getFranchiseRes2 = [
                    {
                        id: 35,
                        name: "test pizza",
                        admins: [
                            {
                                id: 1,
                                name: "常用名字",
                                email: "a@jwt.com",
                            },
                        ],
                        stores: [],
                    },
                ];

                expect(method).toBe("GET");
                await route.fulfill({ json: getFranchiseRes2 });

                break;

            case 4:
                const closeFranchiseRes = { message: "franchise deleted" };

                expect(method).toBe("DELETE");
                expect(postData).toMatchObject({ id: 35 });
                await route.fulfill({ json: closeFranchiseRes });

                break;
        }
    });

    await page.goto("/login");
    await page.getByPlaceholder("Email address").fill("a@jwt.com");
    await page.getByPlaceholder("Password").click();
    await page.getByPlaceholder("Password").fill("admin");
    await page.getByRole("button", { name: "Login" }).click();
    await page.getByRole("link", { name: "Admin" }).click();
    await page.getByRole("button", { name: "Add Franchise" }).click();
    await page.getByPlaceholder("franchise name").fill("test pizza");
    await page.getByPlaceholder("franchisee admin email").fill("a@jwt.com");
    await page.getByRole("button", { name: "Create" }).click();
    await page
        .getByRole("row", { name: "test pizza 常用名字 Close" })
        .getByRole("button")
        .click();
    await page.getByRole("button", { name: "Close" }).click();
});
