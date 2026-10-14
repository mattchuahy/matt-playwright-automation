VALID_ORDER = {
    "customerId": 1,
    "items": [{"productId": 42, "quantity": 2}],
}

INVALID_ORDER = {
    "customerId": 1,
    "items": [],
}


def check_create_order_succeeds(api):
    response = api.post("/orders", VALID_ORDER)

    assert response.status == 201, "expected 201 created"
    assert "id" in response.body, "expected created order to have an id"


def check_invalid_order_is_rejected(api):
    response = api.post("/orders", INVALID_ORDER)

    assert response.status == 400, "expected 400 bad request"
    assert "error" in response.body, "expected error field"


def check_moved_permanently(api):
    response = api.get("/status/301")

    assert response.status == 301, "expected 301 moved permanently"


def check_found(api):
    response = api.get("/status/302")

    assert response.status == 302, "expected 302 found"


def check_bad_request(api):
    response = api.get("/status/400")

    assert response.status == 400, "expected 400 bad request"


def check_not_found(api):
    response = api.get("/status/404")

    assert response.status == 404, "expected 404 not found"


def check_internal_server_error(api):
    response = api.get("/status/500")

    assert response.status == 500, "expected 500 internal server error"


def check_not_implemented(api):
    response = api.get("/status/501")

    assert response.status == 501, "expected 501 not implemented"
