import os
import io
import re
import csv
import math
import json
import zipfile
import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Optional, Tuple

def sniff_delimiter(text_sample: str) -> str:
    """Detects delimiter from common candidates: comma, semicolon, tab, pipe."""
    lines = [l for l in text_sample.splitlines() if l.strip()][:10]
    if not lines:
        return ","
    candidates = [",", ";", "\t", "|"]
    best_delim = ","
    best_consistency = -1

    for delim in candidates:
        counts = [line.count(delim) for line in lines]
        if len(counts) > 0 and counts[0] > 0 and len(set(counts)) == 1:
            return delim
        avg = sum(counts) / len(counts)
        if avg > best_consistency and all(c > 0 for c in counts):
            best_consistency = avg
            best_delim = delim

    return best_delim


def parse_csv_bytes(file_bytes: bytes, filename: str = "dataset.csv") -> Dict[str, Any]:
    """
    Parses CSV/TSV bytes using Python standard library with delimiter auto-detection.
    Handles UTF-8, Latin-1, CP1252 encodings.
    """
    decoded = None
    for enc in ["utf-8-sig", "utf-8", "latin-1", "cp1252"]:
        try:
            decoded = file_bytes.decode(enc)
            break
        except UnicodeDecodeError:
            continue

    if decoded is None:
        raise ValueError("Could not decode file with standard text encodings.")

    if not decoded.strip():
        raise ValueError("The uploaded CSV file is empty.")

    sample = decoded[:4096]
    delimiter = sniff_delimiter(sample)

    reader = csv.reader(io.StringIO(decoded), delimiter=delimiter)
    rows: List[List[str]] = []
    for row in reader:
        # Normalize cell values (strip raw null representations)
        cleaned_row = [cell.strip() if cell is not None else "" for cell in row]
        if any(cleaned_row):
            rows.append(cleaned_row)

    if not rows:
        raise ValueError("No data rows found in CSV file.")

    raw_headers = rows[0]
    # Deduplicate and sanitize headers
    seen_headers = {}
    headers = []
    for i, h in enumerate(raw_headers):
        name = h.strip() or f"Column_{i + 1}"
        if name in seen_headers:
            seen_headers[name] += 1
            headers.append(f"{name}_{seen_headers[name]}")
        else:
            seen_headers[name] = 0
            headers.append(name)

    data_rows = rows[1:]
    col_count = len(headers)

    records: List[Dict[str, Any]] = []
    for r in data_rows:
        # Pad or truncate row to match column count
        padded = r + [""] * (col_count - len(r)) if len(r) < col_count else r[:col_count]
        record = {headers[i]: padded[i] for i in range(col_count)}
        records.append(record)

    return {
        "filename": filename,
        "file_type": "csv",
        "columns": headers,
        "rows": records,
        "row_count": len(records),
        "column_count": col_count,
        "file_size_bytes": len(file_bytes)
    }


def parse_xlsx_bytes(file_bytes: bytes, filename: str = "dataset.xlsx") -> Dict[str, Any]:
    """
    Parses XLSX bytes using Python standard library zipfile and xml.etree.ElementTree.
    Reads sharedStrings.xml and the first active sheet (sheet1.xml).
    """
    try:
        zf = zipfile.ZipFile(io.BytesIO(file_bytes))
    except Exception as e:
        raise ValueError(f"Invalid or corrupted Excel file archive: {str(e)}")

    # 1. Parse Shared Strings
    shared_strings: List[str] = []
    if "xl/sharedStrings.xml" in zf.namelist():
        try:
            ss_xml = zf.read("xl/sharedStrings.xml")
            root = ET.fromstring(ss_xml)
            for si in root:
                # Text can be in <t> directly or multiple <r><t> runs
                t_elems = si.findall(".//{*}t")
                text = "".join([t.text or "" for t in t_elems])
                shared_strings.append(text)
        except Exception:
            shared_strings = []

    # 2. Locate first worksheet
    sheet_files = [n for n in zf.namelist() if n.startswith("xl/worksheets/sheet") and n.endswith(".xml")]
    if not sheet_files:
        raise ValueError("Excel file contains no worksheets.")
    target_sheet = sheet_files[0]

    try:
        sheet_xml = zf.read(target_sheet)
        sheet_root = ET.fromstring(sheet_xml)
    except Exception as e:
        raise ValueError(f"Could not parse Excel worksheet XML: {str(e)}")

    # Parse rows
    parsed_matrix: List[Dict[int, str]] = []
    max_col_idx = 0

    def col_str_to_idx(col_str: str) -> int:
        idx = 0
        for char in col_str.upper():
            if 'A' <= char <= 'Z':
                idx = idx * 26 + (ord(char) - ord('A') + 1)
        return idx - 1

    for row_elem in sheet_root.findall(".//{*}row"):
        row_dict: Dict[int, str] = {}
        for c in row_elem.findall("{*}c"):
            r_attr = c.get("r", "")
            match = re.match(r"([A-Z]+)(\d+)", r_attr)
            if match:
                col_idx = col_str_to_idx(match.group(1))
            else:
                col_idx = len(row_dict)

            max_col_idx = max(max_col_idx, col_idx)
            cell_type = c.get("t", "")
            v_elem = c.find("{*}v")
            val_text = v_elem.text if v_elem is not None and v_elem.text is not None else ""

            if cell_type == "s" and val_text.isdigit():
                idx = int(val_text)
                cell_value = shared_strings[idx] if idx < len(shared_strings) else ""
            elif cell_type == "inlineStr":
                is_elem = c.find(".//{*}t")
                cell_value = is_elem.text if is_elem is not None and is_elem.text else ""
            else:
                cell_value = val_text

            row_dict[col_idx] = cell_value.strip()

        if row_dict:
            parsed_matrix.append(row_dict)

    if not parsed_matrix:
        raise ValueError("Excel worksheet contains no data rows.")

    total_cols = max_col_idx + 1
    # First row as header
    header_row_dict = parsed_matrix[0]
    headers = []
    seen_headers = {}
    for c in range(total_cols):
        h_val = header_row_dict.get(c, "").strip() or f"Column_{c + 1}"
        if h_val in seen_headers:
            seen_headers[h_val] += 1
            headers.append(f"{h_val}_{seen_headers[h_val]}")
        else:
            seen_headers[h_val] = 0
            headers.append(h_val)

    records: List[Dict[str, Any]] = []
    for r_dict in parsed_matrix[1:]:
        row_record = {headers[c]: r_dict.get(c, "") for c in range(total_cols)}
        records.append(row_record)

    return {
        "filename": filename,
        "file_type": "xlsx",
        "columns": headers,
        "rows": records,
        "row_count": len(records),
        "column_count": total_cols,
        "file_size_bytes": len(file_bytes)
    }


def is_null_val(val: Any) -> bool:
    if val is None:
        return True
    s = str(val).strip().lower()
    return s in ["", "null", "none", "nan", "n/a", "na", "-", "undefined", "nil", "?"]


def infer_data_type(values: List[Any]) -> str:
    """
    Infers data type as 'numeric', 'datetime', 'boolean', or 'categorical'.
    """
    valid_values = [v for v in values if not is_null_val(v)]
    if not valid_values:
        return "categorical"

    # Check boolean
    bool_matches = sum(1 for v in valid_values if str(v).lower() in ["true", "false", "yes", "no", "0", "1"])
    if bool_matches / len(valid_values) > 0.95 and len(set(str(v).lower() for v in valid_values)) <= 2:
        return "boolean"

    # Check numeric
    numeric_matches = 0
    for v in valid_values:
        cleaned = str(v).replace(",", "").replace("$", "").replace("%", "").strip()
        try:
            float(cleaned)
            numeric_matches += 1
        except ValueError:
            pass

    if numeric_matches / len(valid_values) >= 0.85:
        return "numeric"

    # Check date
    date_matches = 0
    date_patterns = [
        r"^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}",
        r"^\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}",
        r"^\d{4}-\d{2}-\d{2}T"
    ]
    for v in valid_values:
        s = str(v).strip()
        if any(re.match(p, s) for p in date_patterns):
            date_matches += 1

    if date_matches / len(valid_values) >= 0.70:
        return "datetime"

    return "categorical"


def analyze_dataset(parsed_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes deterministic statistical profile, column explanations, data quality metrics,
    and pairwise Pearson correlation matrix.
    """
    rows = parsed_data["rows"]
    columns = parsed_data["columns"]
    row_count = len(rows)
    col_count = len(columns)
    total_cells = row_count * col_count

    # 1. Column-by-column metrics
    column_profiles = {}
    col_types = {}
    numeric_columns = []
    categorical_columns = []
    datetime_columns = []
    total_missing_cells = 0

    for col in columns:
        vals = [r.get(col) for r in rows]
        missing_count = sum(1 for v in vals if is_null_val(v))
        total_missing_cells += missing_count
        valid_vals = [v for v in vals if not is_null_val(v)]
        unique_vals = list(set(str(v).strip() for v in valid_vals))
        dtype = infer_data_type(vals)
        col_types[col] = dtype

        examples = unique_vals[:3]
        col_summary: Dict[str, Any] = {
            "name": col,
            "data_type": dtype,
            "missing_count": missing_count,
            "missing_percentage": round((missing_count / row_count * 100) if row_count > 0 else 0, 1),
            "unique_count": len(unique_vals),
            "examples": examples,
            "meaning": generate_column_meaning(col, dtype, examples)
        }

        if dtype == "numeric":
            numeric_columns.append(col)
            # Compute descriptive stats
            nums = []
            for v in valid_vals:
                try:
                    nums.append(float(str(v).replace(",", "").replace("$", "").replace("%", "").strip()))
                except ValueError:
                    pass

            if nums:
                nums.sort()
                n = len(nums)
                mean_val = sum(nums) / n
                median_val = nums[n // 2] if n % 2 != 0 else (nums[n // 2 - 1] + nums[n // 2]) / 2
                variance = sum((x - mean_val) ** 2 for x in nums) / n if n > 1 else 0
                std_val = math.sqrt(variance)
                q1 = nums[int(n * 0.25)]
                q3 = nums[int(n * 0.75)]
                iqr = q3 - q1
                lower_bound = q1 - 1.5 * iqr
                upper_bound = q3 + 1.5 * iqr
                outliers = [x for x in nums if x < lower_bound or x > upper_bound]

                col_summary["stats"] = {
                    "count": n,
                    "min": round(nums[0], 2),
                    "max": round(nums[-1], 2),
                    "mean": round(mean_val, 2),
                    "median": round(median_val, 2),
                    "std": round(std_val, 2),
                    "q1": round(q1, 2),
                    "q3": round(q3, 2),
                    "iqr": round(iqr, 2),
                    "outlier_count": len(outliers),
                    "outliers_sample": [round(x, 2) for x in outliers[:5]]
                }
        elif dtype == "datetime":
            datetime_columns.append(col)
        else:
            categorical_columns.append(col)

        column_profiles[col] = col_summary

    # 2. Duplicate rows audit
    row_hashes = {}
    duplicate_rows_indices = []
    for i, r in enumerate(rows):
        r_str = json.dumps([str(r.get(c, "")).strip().lower() for c in columns])
        if r_str in row_hashes:
            duplicate_rows_indices.append(i)
        else:
            row_hashes[r_str] = i

    duplicate_count = len(duplicate_rows_indices)
    duplicate_percentage = round((duplicate_count / row_count * 100) if row_count > 0 else 0, 1)

    # 3. Text inconsistency audit (trailing spaces, inconsistent capitalization)
    inconsistent_categories = {}
    for col in categorical_columns:
        vals = [str(r.get(col, "")).strip() for r in rows if not is_null_val(r.get(col))]
        lower_map = {}
        for v in vals:
            low = v.lower()
            lower_map.setdefault(low, set()).add(v)
        casing_conflicts = [list(variations) for variations in lower_map.values() if len(variations) > 1]
        if casing_conflicts:
            inconsistent_categories[col] = casing_conflicts[:3]

    # 4. Correlation matrix for numeric variables
    correlation_matrix = {}
    if len(numeric_columns) >= 2:
        for c1 in numeric_columns:
            correlation_matrix[c1] = {}
            for c2 in numeric_columns:
                if c1 == c2:
                    correlation_matrix[c1][c2] = 1.0
                else:
                    r_val = calculate_pearson_r(rows, c1, c2)
                    correlation_matrix[c1][c2] = r_val

    # 5. Semantic Dataset Purpose Explanation
    dataset_explanation = generate_dataset_explanation(
        parsed_data["filename"],
        columns,
        numeric_columns,
        categorical_columns,
        datetime_columns,
        row_count
    )

    return {
        "overview": {
            "filename": parsed_data["filename"],
            "file_type": parsed_data["file_type"],
            "file_size_bytes": parsed_data.get("file_size_bytes", 0),
            "row_count": row_count,
            "column_count": col_count,
            "total_cells": total_cells,
            "numeric_count": len(numeric_columns),
            "categorical_count": len(categorical_columns),
            "datetime_count": len(datetime_columns),
            "missing_cell_count": total_missing_cells,
            "missing_percentage": round((total_missing_cells / total_cells * 100) if total_cells > 0 else 0, 1),
            "duplicate_row_count": duplicate_count,
            "duplicate_percentage": duplicate_percentage
        },
        "explanation": dataset_explanation,
        "columns": column_profiles,
        "quality_audit": {
            "duplicate_rows_count": duplicate_count,
            "duplicate_rows_indices": duplicate_rows_indices[:20],
            "total_missing_cells": total_missing_cells,
            "inconsistent_categories": inconsistent_categories,
            "constant_columns": [c for c, p in column_profiles.items() if p["unique_count"] <= 1],
            "high_cardinality_id_columns": [c for c, p in column_profiles.items() if p["unique_count"] == row_count and row_count > 20]
        },
        "correlations": correlation_matrix,
        "numeric_columns": numeric_columns,
        "categorical_columns": categorical_columns,
        "datetime_columns": datetime_columns
    }


def calculate_pearson_r(rows: List[Dict[str, Any]], col1: str, col2: str) -> float:
    """Calculates Pearson correlation coefficient between two numeric columns."""
    pairs = []
    for r in rows:
        v1 = r.get(col1)
        v2 = r.get(col2)
        if not is_null_val(v1) and not is_null_val(v2):
            try:
                x = float(str(v1).replace(",", "").replace("$", "").replace("%", "").strip())
                y = float(str(v2).replace(",", "").replace("$", "").replace("%", "").strip())
                pairs.append((x, y))
            except ValueError:
                pass

    if len(pairs) < 3:
        return 0.0

    n = len(pairs)
    sum_x = sum(p[0] for p in pairs)
    sum_y = sum(p[1] for p in pairs)
    sum_x2 = sum(p[0] ** 2 for p in pairs)
    sum_y2 = sum(p[1] ** 2 for p in pairs)
    sum_xy = sum(p[0] * p[1] for p in pairs)

    numerator = (n * sum_xy) - (sum_x * sum_y)
    denom_sq = ((n * sum_x2) - (sum_x ** 2)) * ((n * sum_y2) - (sum_y ** 2))

    if denom_sq <= 0:
        return 0.0

    r = numerator / math.sqrt(denom_sq)
    return round(max(-1.0, min(1.0, r)), 3)


def generate_column_meaning(col_name: str, dtype: str, examples: List[str]) -> str:
    """Generates conservative, educational meaning for each column without hallucinating."""
    low = col_name.lower().replace("_", " ").replace("-", " ")
    examples_str = f" (e.g. {', '.join(examples[:2])})" if examples else ""

    if any(k in low for k in ["id", "uuid", "key", "code"]):
        return f"Identifier variable representing unique entity reference{examples_str}."
    if any(k in low for k in ["name", "first name", "last name", "customer", "client"]):
        return f"Categorical label indicating individual or account name{examples_str}."
    if any(k in low for k in ["age", "years"]):
        return f"Numeric metric measuring duration in years or age{examples_str}."
    if any(k in low for k in ["sales", "revenue", "amount", "price", "cost", "spend", "salary"]):
        return f"Quantitative monetary value associated with transactions or compensation{examples_str}."
    if any(k in low for k in ["date", "timestamp", "created", "order date", "time"]):
        return f"Temporal timestamp field tracking when the record or event occurred{examples_str}."
    if any(k in low for k in ["region", "country", "city", "state", "location", "territory"]):
        return f"Categorical attribute classifying records by geographic zone{examples_str}."
    if any(k in low for k in ["status", "churn", "active", "stage", "outcome"]):
        return f"Categorical state variable describing current condition or result{examples_str}."
    if any(k in low for k in ["score", "rating", "satisfaction", "nps"]):
        return f"Evaluated metric reflecting performance, satisfaction, or rating index{examples_str}."
    if any(k in low for k in ["quantity", "count", "units", "items"]):
        return f"Discrete numerical counter of volume or frequency{examples_str}."

    if dtype == "numeric":
        return f"Numeric variable measuring quantitative values across records{examples_str}."
    elif dtype == "datetime":
        return f"Date/time variable indicating chronology or scheduling{examples_str}."
    elif dtype == "boolean":
        return f"Binary logical flag denoting true/false condition{examples_str}."

    return "RAIZO could not confidently determine the business meaning of this field."


def generate_dataset_explanation(
    filename: str,
    columns: List[str],
    numeric_cols: List[str],
    cat_cols: List[str],
    date_cols: List[str],
    row_count: int
) -> Dict[str, Any]:
    """Provides high-level semantic synthesis of what the dataset represents."""
    cols_joined = " ".join(columns).lower()

    summary_type = "general tabular dataset"
    purpose = "The dataset appears to contain structured business or transactional observations."

    if any(k in cols_joined for k in ["sale", "revenue", "product", "order", "price", "customer"]):
        summary_type = "Sales & Customer Transaction Dataset"
        purpose = (
            "The dataset appears to contain commercial transactional records capturing customer interactions, "
            "order items, revenue figures, and potential regional purchasing patterns."
        )
    elif any(k in cols_joined for k in ["employee", "salary", "department", "attrition", "hire", "tenure"]):
        summary_type = "Human Resources & Workforce Analytics"
        purpose = (
            "The dataset appears to contain organizational personnel records detailing employee profiles, "
            "departmental affiliations, tenure durations, and compensation benchmarks."
        )
    elif any(k in cols_joined for k in ["patient", "diagnosis", "hospital", "doctor", "treatment", "bed"]):
        summary_type = "Healthcare Clinical or Operational Data"
        purpose = (
            "The dataset appears to contain clinical operational logs tracking patient encounters, "
            "care protocols, treatment durations, and outcome metrics."
        )
    elif any(k in cols_joined for k in ["churn", "retention", "subscription", "plan", "monthly", "user"]):
        summary_type = "Subscription & User Retention Logs"
        purpose = (
            "The dataset appears to contain SaaS or subscription engagement logs recording customer usage, "
            "recurring billing plans, service tenure, and retention status."
        )

    return {
        "title": summary_type,
        "purpose": purpose,
        "dimensions": f"{row_count:,} observations across {len(columns)} attributes",
        "structure": {
            "numeric_variables": numeric_cols[:6],
            "categorical_variables": cat_cols[:6],
            "temporal_variables": date_cols[:3]
        }
    }


def clean_dataset(
    rows: List[Dict[str, Any]],
    columns: List[str],
    actions: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Executes deterministic, non-destructive cleaning transformations.
    Actions supported:
    - remove_duplicates
    - impute_missing: { column: str, strategy: 'mean'|'median'|'mode'|'drop'|'forward_fill' }
    - trim_whitespace: { column?: str }
    - standardize_casing: { column: str, casing: 'title'|'lower'|'upper' }
    """
    working_rows = [dict(r) for r in rows]
    transformations_log: List[Dict[str, Any]] = []

    for action in actions:
        act_type = action.get("type") or action.get("action")

        if act_type == "remove_duplicates":
            before_cnt = len(working_rows)
            seen = set()
            deduped = []
            for r in working_rows:
                key = json.dumps([str(r.get(c, "")).strip().lower() for c in columns])
                if key not in seen:
                    seen.add(key)
                    deduped.append(r)
            working_rows = deduped
            removed = before_cnt - len(working_rows)
            transformations_log.append({
                "action": "Remove Duplicate Rows",
                "target": "Entire Dataset",
                "rows_affected": removed,
                "what_changed": f"Removed {removed} duplicate record(s) matching on all attributes.",
                "why_recommended": "Duplicate rows artificially inflate sample sizes, distort averages, and skew statistical tests."
            })

        elif act_type == "impute_missing":
            col = action.get("column")
            strategy = action.get("strategy", "median")
            if col in columns:
                valid_vals = [r[col] for r in working_rows if not is_null_val(r.get(col))]
                affected = len(working_rows) - len(valid_vals)

                if strategy == "drop":
                    working_rows = [r for r in working_rows if not is_null_val(r.get(col))]
                    transformations_log.append({
                        "action": "Drop Missing Rows",
                        "target": col,
                        "rows_affected": affected,
                        "what_changed": f"Removed {affected} row(s) with missing values in '{col}'.",
                        "why_recommended": "When missingness is low (<5%) and random, dropping avoids introducing synthetic imputation bias."
                    })
                elif strategy in ["mean", "median"]:
                    numeric_vals = []
                    for v in valid_vals:
                        try:
                            numeric_vals.append(float(str(v).replace(",", "").replace("$", "").replace("%", "").strip()))
                        except ValueError:
                            pass

                    if numeric_vals:
                        numeric_vals.sort()
                        replacement_val = (
                            round(sum(numeric_vals) / len(numeric_vals), 2)
                            if strategy == "mean"
                            else round(numeric_vals[len(numeric_vals) // 2], 2)
                        )
                        for r in working_rows:
                            if is_null_val(r.get(col)):
                                r[col] = str(replacement_val)

                        transformations_log.append({
                            "action": f"Impute with {strategy.capitalize()}",
                            "target": col,
                            "rows_affected": affected,
                            "what_changed": f"Filled {affected} missing cell(s) in '{col}' with calculated {strategy} ({replacement_val}).",
                            "why_recommended": f"Preserves complete record count without dropping rows. {strategy.capitalize()} is {'robust to skewness' if strategy == 'median' else 'suitable for symmetric distributions'}."
                        })
                elif strategy == "mode":
                    freq = {}
                    for v in valid_vals:
                        s = str(v).strip()
                        freq[s] = freq.get(s, 0) + 1
                    mode_val = max(freq, key=freq.get) if freq else "Unknown"
                    for r in working_rows:
                        if is_null_val(r.get(col)):
                            r[col] = mode_val
                    transformations_log.append({
                        "action": "Impute with Mode",
                        "target": col,
                        "rows_affected": affected,
                        "what_changed": f"Filled {affected} missing cell(s) in '{col}' with most frequent category ('{mode_val}').",
                        "why_recommended": "Mode imputation preserves category probability mass for non-numeric fields."
                    })

        elif act_type == "trim_whitespace":
            target_col = action.get("column")
            target_cols = [target_col] if target_col and target_col in columns else columns
            changed_count = 0
            for r in working_rows:
                for c in target_cols:
                    orig = str(r.get(c, ""))
                    trimmed = orig.strip()
                    if orig != trimmed:
                        r[c] = trimmed
                        changed_count += 1

            transformations_log.append({
                "action": "Trim Whitespace",
                "target": target_col or "All Columns",
                "rows_affected": changed_count,
                "what_changed": f"Removed leading and trailing whitespace from {changed_count} cell(s).",
                "why_recommended": "Hidden spaces cause string comparison mismatches, duplicate categories in GROUP BY queries, and failed joins."
            })

        elif act_type == "standardize_casing":
            col = action.get("column")
            casing = action.get("casing", "title")
            if col in columns:
                changed = 0
                for r in working_rows:
                    orig = str(r.get(col, ""))
                    if not is_null_val(orig):
                        new_val = orig.title() if casing == "title" else orig.lower() if casing == "lower" else orig.upper()
                        if orig != new_val:
                            r[col] = new_val
                            changed += 1

                transformations_log.append({
                    "action": f"Standardize Casing ({casing.capitalize()})",
                    "target": col,
                    "rows_affected": changed,
                    "what_changed": f"Normalized {changed} value(s) in '{col}' to {casing} format.",
                    "why_recommended": "Ensures distinct records with casing variations (e.g. 'Delhi' vs 'delhi') aggregate into a single consistent category."
                })

    return {
        "cleaned_rows": working_rows,
        "row_count": len(working_rows),
        "column_count": len(columns),
        "transformations": transformations_log
    }
