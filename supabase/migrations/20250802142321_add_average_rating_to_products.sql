ALTER TABLE products
ADD COLUMN average_rating NUMERIC(2, 1) DEFAULT 0.0;

CREATE OR REPLACE FUNCTION update_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET average_rating = (
    SELECT AVG(rating)
    FROM reviews
    WHERE product_id = NEW.product_id
  )
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_average_rating();
